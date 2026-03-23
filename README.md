# Diet

モバイル版と Web 版を同じリポジトリで管理するワークスペースです。  
境界を明確にするため、Expo / React Native 側は `mobile/`、Next.js 側は `web/` に分離しました。

## Quick Links

- [開発規約 `AGENTS.md`](AGENTS.md)
- [モバイル版 README `mobile/README.md`](mobile/README.md)
- [Web 版 README `web/README.md`](web/README.md)
- [要件仕様 `docs/requirements.md`](docs/requirements.md)
- [設計思想 `docs/design.md`](docs/design.md)

## Directory Layout

- `mobile/`
  Expo Router ベースのモバイルアプリ本体。`src/`、`ios/`、`android/`、各種 Expo 設定を含む。
- `web/`
  Next.js App Router ベースの Web アプリ本体。
- `docs/`
  共通の仕様・設計ドキュメント。
- `memo/`, `tasks/`
  開発メモと補助資料。

## Commands

```bash
# Mobile
npm run mobile:start
npm run mobile:ios
npm run mobile:android
npm run mobile:web
npm run mobile:lint

# Web
npm run web
npm run web:build
```

互換のため、`npm run start` / `npm run ios` / `npm run android` / `npm run lint` は mobile 側へ委譲します。
