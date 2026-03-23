# mobile/README.md

## 責務
- `mobile` 配下の Expo / React Native アプリの起動方法と構成意図をまとめる。

## 使用箇所
- モバイル版をローカル起動・ビルドする開発者が参照する。

## やらないこと
- Web 版 Next.js アプリの手順説明
- プロダクト全体の仕様定義

## 他ファイルとの関係
- `mobile/package.json` のスクリプト、`mobile/src/` のアプリ本体、`mobile/ios/` と `mobile/android/` のネイティブプロジェクトと対応する。

## 起動方法

```bash
cd mobile
npm install
npm run start
```

またはルートから:

```bash
npm run mobile:start
```

## ディレクトリ概要

- `mobile/src/app/`
  Expo Router の画面エントリー。
- `mobile/src/features/`
  Record / History / Foods / Settings の画面単位 UI。
- `mobile/src/agents/`
  解析、保存、履歴、目標、通知などの業務ロジック。
- `mobile/ios/`, `mobile/android/`
  ネイティブプロジェクト。

## 補足

- Expo 設定ファイル、ネイティブプロジェクト、モバイル専用 assets はすべて `mobile/` に集約した。
- Web 版は `../web/` を参照する。
