/**
 * web/src/lib/openai-record-analysis.ts
 *
 * 【責務】
 * Record 用の食事 prompt を OpenAI へ送り、解析レスポンスへ整形する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - app/api/record/analyze/route.ts から呼ばれる。
 * - OpenAI の応答を record 用レスポンスへ変換する。
 *
 * 【やらないこと】
 * - UI 描画
 * - フォーム state 更新
 * - ルートレスポンス生成
 *
 * 【他ファイルとの関係】
 * - record-analysis-schema.ts の型に合わせたデータを返す。
 */

import type { RecordAnalysisResponse } from '@/features/record/record-analysis-schema';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT =
  'You are a nutrition assistant. Respond ONLY with valid JSON matching this schema: {"menuName":"string","originalText":"string","warnings":["string"],"items":[{"name":"string","amount":"string","kcal":number,"protein":number,"fat":number,"carbs":number}]}. Numbers must be realistic, non-negative, and rounded to at most one decimal place.';

type RawOpenAIResponse = {
  menuName?: string;
  originalText?: string;
  warnings?: string[];
  items?: Array<{
    name?: string;
    amount?: string;
    kcal?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  }>;
};

function sanitizeNumber(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed * 10) / 10;
}

function buildMealName(prompt: string): string {
  const compact = prompt.replace(/\s+/g, ' ').trim();

  if (compact.length === 0) {
    return '新しいメニュー';
  }

  return compact.length > 20 ? `${compact.slice(0, 20)}…` : compact;
}

function buildFallbackItems(prompt: string): RecordAnalysisResponse['items'] {
  const candidates = prompt
    .split(/\n|、|,|。/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (candidates.length === 0) {
    return [
      {
        name: '推定メニュー',
        amount: '1人前',
        kcal: 400,
        protein: 20,
        fat: 15,
        carbs: 45,
      },
    ];
  }

  return candidates.map((phrase, index) => {
    const kcal = 220 + index * 60;

    return {
      name: phrase,
      amount: '1人前',
      kcal,
      protein: Math.round(kcal * 0.12),
      fat: Math.round(kcal * 0.08),
      carbs: Math.round(kcal * 0.12),
    };
  });
}

function createFallbackRecordAnalysis(prompt: string): RecordAnalysisResponse {
  const items = buildFallbackItems(prompt);

  return {
    menuName: buildMealName(prompt),
    originalText: prompt,
    items,
    warnings: ['AI解析に失敗したため、簡易推定で下書きを生成しました。'],
    source: 'fallback',
  };
}

function extractMessageContent(raw: unknown): string | null {
  if (typeof raw === 'string') {
    return raw;
  }

  if (Array.isArray(raw)) {
    const parts = raw
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (
          typeof part === 'object' &&
          part !== null &&
          'text' in part &&
          typeof part.text === 'string'
        ) {
          return part.text;
        }

        return null;
      })
      .filter((value): value is string => value !== null);

    return parts.join('\n');
  }

  return null;
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

function parseOpenAIResponse(content: string): RawOpenAIResponse | null {
  try {
    return JSON.parse(extractJson(content.trim())) as RawOpenAIResponse;
  } catch {
    return null;
  }
}

function normalizeOpenAIResponse(
  prompt: string,
  raw: RawOpenAIResponse,
): RecordAnalysisResponse | null {
  const normalizedItems = (raw.items ?? [])
    .map((item, index) => ({
      name: item.name?.trim() || `食品${index + 1}`,
      amount: item.amount?.trim() || '1人前',
      kcal: sanitizeNumber(item.kcal),
      protein: sanitizeNumber(item.protein),
      fat: sanitizeNumber(item.fat),
      carbs: sanitizeNumber(item.carbs),
    }))
    .filter((item) => item.name.length > 0);

  if (normalizedItems.length === 0) {
    return null;
  }

  return {
    menuName: raw.menuName?.trim() || buildMealName(prompt),
    originalText: raw.originalText?.trim() || prompt,
    items: normalizedItems,
    warnings: raw.warnings ?? [],
    source: 'text',
  };
}

/**
 * prompt を解析して record 用レスポンスを返す。
 * 呼び出し元: app/api/record/analyze/route.ts
 * @param prompt ユーザー入力
 * @returns 解析済みレスポンス
 * @remarks OpenAI キー未設定時や失敗時は fallback を返す。
 */
export async function analyzeRecordPrompt(
  prompt: string,
): Promise<RecordAnalysisResponse> {
  const normalizedPrompt = prompt.trim();

  if (normalizedPrompt.length === 0) {
    return createFallbackRecordAnalysis(prompt);
  }

  const apiKey =
    process.env.OPENAI_API_KEY ?? process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return createFallbackRecordAnalysis(normalizedPrompt);
  }

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `分析対象の食事: ${normalizedPrompt}\nJSONのみで回答してください。`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return createFallbackRecordAnalysis(normalizedPrompt);
    }

    const payload = await response.json();
    const content = extractMessageContent(payload?.choices?.[0]?.message?.content);

    if (!content) {
      return createFallbackRecordAnalysis(normalizedPrompt);
    }

    const parsed = parseOpenAIResponse(content);

    if (!parsed) {
      return createFallbackRecordAnalysis(normalizedPrompt);
    }

    return normalizeOpenAIResponse(normalizedPrompt, parsed)
      ?? createFallbackRecordAnalysis(normalizedPrompt);
  } catch {
    return createFallbackRecordAnalysis(normalizedPrompt);
  }
}
