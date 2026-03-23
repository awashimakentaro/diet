/**
 * web/postcss.config.mjs
 *
 * 【責務】
 * Tailwind CSS と autoprefixer の PostCSS 設定を提供する。
 *
 * 【使用箇所】
 * - Next.js ビルド時
 * - Storybook ビルド時
 *
 * 【やらないこと】
 * - CSS 記述
 * - UI ロジックの実装
 *
 * 【他ファイルとの関係】
 * - web/tailwind.config.ts と組み合わせてスタイル基盤を構成する。
 */

const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
