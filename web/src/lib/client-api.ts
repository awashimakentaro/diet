/**
 * web/src/lib/client-api.ts
 *
 * 【責務】
 * Web 版のクライアント API 呼び出しと Zod バリデーションをまとめる。
 *
 * 【使用箇所】
 * - web/src/hooks/use-daily-summary-swr.ts
 * - 今後の API Client 実装
 *
 * 【やらないこと】
 * - SWR の状態管理
 * - UI 描画
 * - サーバー側 DB 接続
 *
 * 【他ファイルとの関係】
 * - Zod スキーマを受け取り、fetch 結果の型安全性を担保する。
 */

import { z } from 'zod';

type FetchLike = typeof fetch;

/**
 * fetch の JSON 応答を Zod で検証して返す。
 * 呼び出し元: SWR フックや今後の API Client。
 * @param input fetch 対象 URL
 * @param schema 応答検証に使う Zod スキーマ
 * @param init fetch オプション
 * @param fetcher 差し替え可能な fetch 実装
 * @returns 検証済みレスポンス
 * @remarks 副作用: ネットワーク I/O を発生させる。
 */
export async function fetchValidatedJson<TSchema extends z.ZodTypeAny>(
  input: RequestInfo | URL,
  schema: TSchema,
  init?: RequestInit,
  fetcher: FetchLike = fetch,
): Promise<z.infer<TSchema>> {
  const response = await fetcher(input, init);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const payload = await response.json();
  return schema.parse(payload);
}
