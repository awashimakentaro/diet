/**
 * agents/analyze-agent.ts
 *
 * 【責務】
 * テキストもしくは画像入力を解析し、RecordScreen で編集できる Draft JSON を生成する。
 *
 * 【使用箇所】
 * - RecordScreen の解析アクション
 *
 * 【やらないこと】
 * - 永続化
 * - UI 表示
 *
 * 【他ファイルとの関係】
 * - SaveMealAgent が受け取る Draft 構造を定義する。
 */

import { AnalyzeDraft, AnalyzeRequest, FoodItem, FoodCategory, calculateMacroFromItems } from '@/constants/schema';
import { createId } from '@/lib/id';

/**
 * 入力を解析し、最小限の Draft を返す。
 * 呼び出し元: RecordScreen。
 * @param request テキスト or 画像解析リクエスト
 * @returns Draft JSON
 * @remarks ネットワーク AI の代わりに簡易ヒューリスティックで変換する。
 */
export async function analyze(request: AnalyzeRequest): Promise<AnalyzeDraft> {
  if (request.type === 'text') {
    return buildTextDraft(request.prompt);
  }
  return buildImageDraft(request.uri);
}

/**
 * テキスト入力から Draft を構築する。
 * 呼び出し元: analyze。
 * @param prompt ユーザーの自由入力
 * @returns Draft JSON
 * @remarks 副作用は無い。
 */
function buildTextDraft(prompt: string): AnalyzeDraft {
  const normalized = prompt.trim();
  const items = normalized.length === 0 ? [] : createItemsFromText(normalized);
  const warnings = normalized.length === 0 ? ['テキストが空のため、項目を生成できませんでした。'] : [];
  return {
    draftId: createId('draft'),
    menuName: guessMenuNameFromText(normalized),
    originalText: normalized,
    items,
    totals: calculateMacroFromItems(items),
    source: 'text',
    warnings,
  };
}

/**
 * 画像 URI から Draft を組み立てる。
 * 呼び出し元: analyze。
 * @param uri 解析対象の画像 URI
 * @returns Draft JSON
 * @remarks 実際の画像解析は行わず、プレースホルダーを生成する。
 */
function buildImageDraft(uri: string): AnalyzeDraft {
  const items: FoodItem[] = [
    {
      id: createId('item'),
      name: '推定メニュー',
      category: 'dish',
      amount: '1人前',
      kcal: 450,
      protein: 20,
      fat: 15,
      carbs: 55,
    },
  ];
  return {
    draftId: createId('draft'),
    menuName: '画像の食事',
    originalText: `画像URI: ${uri}`,
    items,
    totals: calculateMacroFromItems(items),
    source: 'image',
    warnings: ['画像解析はダミー値です。必要に応じて編集してください。'],
  };
}

/**
 * テキストを文節に分割し FoodItem 配列へ変換する。
 * 呼び出し元: buildTextDraft。
 * @param text 入力テキスト
 * @returns 食品アイテム配列
 * @remarks 副作用は無い。
 */
function createItemsFromText(text: string): FoodItem[] {
  const candidates = text
    .split(/\n|、|,|。/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (candidates.length === 0) {
    return [createFallbackItem(text)];
  }
  return candidates.map((phrase, index) => createItemFromPhrase(phrase, index));
}

/**
 * 文章のキーワードからカテゴリを推定する。
 * 呼び出し元: createItemFromPhrase。
 * @param phrase フレーズ
 * @returns FoodCategory
 */
function guessCategory(phrase: string): FoodCategory {
  if (/サラダ|野菜/.test(phrase)) {
    return 'ingredient';
  }
  if (/スープ|カレー|丼|定食/.test(phrase)) {
    return 'dish';
  }
  return 'unknown';
}

/**
 * 単一フレーズから FoodItem を生成する。
 * 呼び出し元: createItemsFromText。
 * @param phrase 食品名と思われる文字列
 * @param index カロリー推定のためのインデックス
 * @returns FoodItem
 */
function createItemFromPhrase(phrase: string, index: number): FoodItem {
  const kcal = 200 + index * 50;
  return {
    id: createId('item'),
    name: phrase,
    category: guessCategory(phrase),
    amount: '1人前',
    kcal,
    protein: Math.round(kcal * 0.12),
    fat: Math.round(kcal * 0.08),
    carbs: Math.round(kcal * 0.12),
  };
}

/**
 * 解析できなかった場合のフォールバック Item。
 * 呼び出し元: createItemsFromText。
 * @param text 入力全文
 * @returns FoodItem
 */
function createFallbackItem(text: string): FoodItem {
  return {
    id: createId('item'),
    name: text || '不明なメニュー',
    category: 'unknown',
    amount: '1人前',
    kcal: 400,
    protein: 15,
    fat: 12,
    carbs: 45,
  };
}

/**
 * テキスト全体からメニュー名を推定する。
 * 呼び出し元: buildTextDraft。
 * @param text 入力全文
 * @returns メニュー名称
 */
function guessMenuNameFromText(text: string): string {
  if (!text) {
    return '新しいメニュー';
  }
  const firstLine = text.split('\n')[0] ?? 'メニュー';
  return firstLine.length > 15 ? `${firstLine.slice(0, 15)}...` : firstLine;
}
