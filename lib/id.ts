/**
 * lib/id.ts
 *
 * 【責務】
 * ドメインで利用する一意 ID を生成するメソッドを提供する。
 *
 * 【使用箇所】
 * - 各エージェントの保存処理
 * - Draft 生成
 *
 * 【やらないこと】
 * - 永続化との連携
 * - UUID v4 の厳密実装
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts のエンティティ ID に採番する。
 */

let counter = 0;

/**
 * ミリ秒タイムスタンプとインクリメントカウンタから疑似的なユニーク ID を生成する。
 * 呼び出し元: SaveMealAgent, FoodLibraryAgent, GoalAgent。
 * @param prefix ID を識別しやすくするための接頭辞
 * @returns 一意性の高い ID 文字列
 * @remarks 副作用は内部カウンタのインクリメントのみ。
 */
export function createId(prefix: string): string {
  counter += 1;
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${counter.toString(36)}`;
}
