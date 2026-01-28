/**
 * metro.config.js
 *
 * 【責務】
 * Expo/React Native 向けの Metro 設定を提供し、バンドル生成や export:embed で参照される設定値を管理する。
 *
 * 【使用箇所】
 * - `npx react-native bundle`
 * - Xcode の "Bundle React Native code and images" フェーズ（Expo CLI 内部）
 *
 * 【やらないこと】
 * - Expo Router やアプリ固有の設定をここで定義すること。
 * - ビルドパラメータや環境変数の制御。
 *
 * 【他ファイルとの関係】
 * - `package.json` の CLI から暗黙的に読み込まれる。
 * - Expo CLI の `export:embed` コマンドがここで返す設定を利用する。
 */

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { resolve } = require('metro-resolver');

const projectRoot = __dirname;

/**
 * `@/` で始まるインポートパスをプロジェクトルートにマッピングする。
 * 呼び出し元: `resolveRequest` ラッパー
 * 入力: 元のモジュール名
 * 出力: 変換済みモジュール名
 * 副作用: なし
 */
function normalizeAlias(moduleName) {
  if (moduleName.startsWith('@/')) {
    return path.join(projectRoot, moduleName.replace(/^@\//, ''));
  }

  return moduleName;
}

/**
 * Metro バンドラに渡す設定オブジェクトを生成する。
 * 呼び出し元: Metro CLI / Expo CLI
 * 入力: プロジェクトルートのパス
 * 出力: Metro 設定オブジェクト
 * 副作用: なし
 */
function createMetroConfig() {
  const config = getDefaultConfig(projectRoot);
  const previousResolver = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    const normalizedName = normalizeAlias(moduleName);

    if (typeof previousResolver === 'function') {
      return previousResolver(context, normalizedName, platform);
    }

    return resolve(context, normalizedName, platform);
  };

  return config;
}

module.exports = createMetroConfig();
