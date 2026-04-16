/* 【責務】
 * Web サーバー側の構造化ログ出力を提供する。
 */

import pino from 'pino';

export const serverLogger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: {
    app: 'diet-web',
  },
});
