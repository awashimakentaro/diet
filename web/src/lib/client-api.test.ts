/**
 * web/src/lib/client-api.test.ts
 *
 * 【責務】
 * client-api.ts のレスポンス検証挙動をテストする。
 *
 * 【使用箇所】
 * - `npm run test`
 *
 * 【やらないこと】
 * - 本番コードの提供
 * - 実 API 通信
 *
 * 【他ファイルとの関係】
 * - web/src/lib/client-api.ts の回帰を防ぐ。
 */

import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { fetchValidatedJson } from './client-api';

/**
 * client-api の主要ケースを検証する。
 * 呼び出し元: Vitest。
 * @remarks 副作用は存在しない。
 */
describe('fetchValidatedJson', () => {
  /**
   * 正常レスポンスを Zod で検証して返すことを確認する。
   * 呼び出し元: fetchValidatedJson のテストケース。
   * @remarks 副作用は存在しない。
   */
  it('returns parsed payload for successful responses', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ kcal: 320 }), { status: 200 }));
    const schema = z.object({
      kcal: z.number(),
    });

    await expect(fetchValidatedJson('/api/summary', schema, undefined, fetcher)).resolves.toEqual({
      kcal: 320,
    });
  });

  /**
   * 非 2xx 応答時に例外を返すことを確認する。
   * 呼び出し元: fetchValidatedJson のテストケース。
   * @remarks 副作用は存在しない。
   */
  it('throws when the response is not ok', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({}), { status: 500 }));
    const schema = z.object({
      ok: z.boolean(),
    });

    await expect(fetchValidatedJson('/api/summary', schema, undefined, fetcher)).rejects.toThrow(
      'Request failed: 500',
    );
  });
});
