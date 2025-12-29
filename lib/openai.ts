/**
 * lib/openai.ts
 *
 * 【責務】
 * OpenAI API へ解析リクエストを送り、AnalyzeDraft に変換する。
 *
 * 【使用箇所】
 * - agents/analyze-agent.ts
 *
 * 【やらないこと】
 * - UI 表示や状態管理
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の型を利用して Draft を構築する。
 */

import { AnalyzeDraft, FoodItem, calculateMacroFromItems } from '@/constants/schema';
import { createId } from '@/lib/id';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_VISION_MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT =
  'You are a nutrition assistant. Respond ONLY with valid JSON matching this schema: {"menuName":"string","originalText":"string","warnings":string[] optional,"items":[{"name":"string","amount":"string","category":"dish|ingredient|unknown","kcal":number,"protein":number,"fat":number,"carbs":number}]}. Numbers should be realistic and non-negative. If unsure, estimate.';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

/**
 * テキスト入力を基に OpenAI に解析を依頼し、Draft を生成する。
 * API キーが設定されていない場合は null を返す。
 */
export async function requestMealAnalysis(prompt: string): Promise<AnalyzeDraft | null> {
  if (!apiKey) {
    return null;
  }

  const body = {
    model: OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `分析対象の食事: ${prompt}\nJSONのみで回答してください。` },
    ],
  };

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI text response', data);
  const content = extractMessageContent(data?.choices?.[0]?.message?.content);
  if (!content) {
    return null;
  }

  return buildDraftFromContent(prompt, content, 'text');
}

export async function requestMealImageAnalysis(uri: string, base64?: string | null): Promise<AnalyzeDraft | null> {
  if (!apiKey) {
    return null;
  }
  if (!base64) {
    console.warn('OpenAI vision: base64 image is required.');
    return null;
  }

  const dataUrl = `data:image/jpeg;base64,${base64}`;
  const body = {
    model: OPENAI_VISION_MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'この画像に写っている食事を解析し、JSON形式で食品リストを返してください。' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
  };

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI vision request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI vision response', data);
  const content = extractMessageContent(data?.choices?.[0]?.message?.content);
  if (!content) {
    return null;
  }
  return buildDraftFromContent('画像解析結果', content, 'image');
}

type RawResponse = {
  menuName?: string;
  originalText?: string;
  warnings?: string[];
  items?: Array<Partial<FoodItem>>;
};

function parseResponse(content: string): RawResponse | null {
  const normalized = content.trim();
  const jsonText = extractJson(normalized);
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.warn('OpenAI JSON parse error', error);
    return null;
  }
}

function extractJson(content: string): string {
  if (content.startsWith('```')) {
    const match = content.match(/```(?:json)?\n([\s\S]*?)```/);
    if (match?.[1]) {
      return match[1];
    }
  }
  return content;
}

function normalizeItems(items: Array<Partial<FoodItem>>): FoodItem[] {
  if (!items || items.length === 0) {
    return [createPlaceholderItem()];
  }
  return items.map((item, index) => ({
    id: createId('item'),
    name: item.name || `食品${index + 1}`,
    category: (item.category as FoodItem['category']) || 'unknown',
    amount: item.amount || '1人前',
    kcal: sanitizeNumber(item.kcal),
    protein: sanitizeNumber(item.protein),
    fat: sanitizeNumber(item.fat),
    carbs: sanitizeNumber(item.carbs),
  }));
}

function sanitizeNumber(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }
  return Math.round(num * 10) / 10;
}

function createPlaceholderItem(): FoodItem {
  return {
    id: createId('item'),
    name: '推定メニュー',
    category: 'unknown',
    amount: '1人前',
    kcal: 400,
    protein: 20,
    fat: 15,
    carbs: 45,
  };
}
function extractMessageContent(raw: unknown): string | null {
  if (!raw) {
    return null;
  }
  if (typeof raw === 'string') {
    return raw;
  }
  if (Array.isArray(raw)) {
    const texts = raw
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }
        if (part?.type === 'text' || part?.type === 'output_text') {
          return part.text;
        }
        return undefined;
      })
      .filter((value): value is string => typeof value === 'string');
    return texts.join('\n');
  }
  return null;
}

function buildDraftFromContent(fallbackText: string, content: string, source: 'text' | 'image'): AnalyzeDraft | null {
  const parsed = parseResponse(content);
  if (!parsed) {
    return null;
  }
  const items = normalizeItems(parsed.items ?? []);
  return {
    draftId: createId('draft'),
    menuName: parsed.menuName || (source === 'image' ? '画像の食事' : 'AIメニュー'),
    originalText: parsed.originalText || fallbackText,
    items,
    totals: calculateMacroFromItems(items),
    source,
    warnings: parsed.warnings ?? [],
  };
}
