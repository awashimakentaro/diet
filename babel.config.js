/**
 * babel.config.js
 *
 * 【責務】
 * Babel のトランスパイル設定を定義し、Expo/React Native ビルド時にモジュール解決とプリセットを提供する。
 *
 * 【使用箇所】
 * - Metro バンドル処理（`expo start` や `react-native bundle`）
 * - Xcode/Gradle 経由での JS 変換
 *
 * 【やらないこと】
 * - TypeScript 設定や ESLint 設定の管理
 * - ビルドスクリプトの制御
 *
 * 【他ファイルとの関係】
 * - `tsconfig.json` と同じく `@/*` エイリアスを指向し、解決結果を JS 変換に反映する。
 */

/**
 * Babel 設定を返す。
 * 呼び出し元: Babel/Metro ランタイム
 * 入力: Babel API オブジェクト
 * 出力: プリセット・プラグインを含む設定オブジェクト
 * 副作用: API キャッシュ設定のみ
 */
module.exports = function createBabelConfig(api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
          },
        },
      ],
      'expo-router/babel',
    ],
  };
};
