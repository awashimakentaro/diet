# iOS（無料 Apple ID）での再インストール手順

Expo + iOS アプリを Apple Developer 無料アカウントで再インストールする際の手順。7日ごとに署名を更新する操作を Release ビルドのみで完結させる。

## 前提条件

- Mac に Xcode がインストール済み
- iPhone を USB 接続済み
- Xcode に Apple ID（Personal Team）でサインイン済み
- 過去に一度このアプリを実機へインストールできている

## 1. アプリを最新化（コード修正がある場合）

```bash
npx expo export --platform ios
```

- 成功すると `dist/` が生成される。
- 以降は Metro やネット接続なしで進められる。

## 2. Xcode プロジェクトを開く

```bash
open ios/Diet.xcodeproj
```

## 3. Xcode 設定を確認

1. **デバイス選択**: Xcode 上部で実機（自分の iPhone 名）を選択する。
2. **Scheme 設定**: `Product > Scheme > Edit Scheme...` → `Run` の `Build Configuration` を `Release` に変更し Close。
3. **Signing & Capabilities**: Project ナビの `TARGETS > Diet` で以下を確認。
   - ☑ Automatically manage signing
   - Team: 自分の Apple ID（Personal Team）
   - Bundle Identifier: 任意（例: `com.awashima.diet`）

## 4. Release で Run

- Archive は不要。Xcode 左上の ▶︎（Run）をクリックすると Release ビルドが実機へ転送される。
- Metro 起動やネット接続は不要。

## 5. iPhone 側での信頼設定（初回のみ）

インストール後に「信頼されていないデベロッパ」と表示された場合:

1. 設定 → 一般 → VPN とデバイス管理
2. `Apple Development: あなたのメール` を選択
3. **信頼** をタップ

## 6. 完了確認

- ホーム画面からアプリを起動し、Wi-Fi / Metro なしで動作することを確認。

## 7. 7日後の再インストール

有効期限が切れたら以下を再実行するだけでよい。

1. `npx expo export --platform ios`
2. Xcode で Release を Run

上記で再インストール完了。
