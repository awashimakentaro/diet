<!--
xcrun-simctl-list-devices.md

【責務】
macOS の開発環境で利用する `xcrun simctl list devices` コマンドの概要と使い方を日本語で整理する。

【使用されるエージェント / 処理フロー】
- ドキュメント参照エージェント (開発者の知識補助)

【やらないこと】
- コマンド実行自体の自動化
- シミュレータ設定ファイルの編集
- 他コマンドの網羅的な説明

【他ファイルとの関係】
- プロジェクト開発メモ (`memo/` ディレクトリ) の一部として参照される。
-->

# `xcrun simctl list devices` とは

Apple が提供するコマンドラインツール `xcrun` のサブコマンドである `simctl` (Simulator Control) から、利用可能な iOS / watchOS / tvOS / visionOS などのシミュレータ端末を一覧表示するためのコマンド。主に以下の用途で使われる。

- Xcode の GUI を開かずに、現在インストールされているシミュレータを確認する。
- 利用可能なデバイス名・UDID を取得し、`simctl boot` や `simctl install` などの他コマンドで指定する値を確認する。
- 開発環境の再構築時に、残存している古いシミュレータを見つけて削除する。

`simctl` は Xcode に付属するため、コマンドを実行するには Xcode または Xcode Command Line Tools がインストールされている必要がある。

## 出力の読み方

コマンドを実行すると、OS ごとに括られたセクションが表示され、それぞれに登録されているシミュレータの一覧が示される。各行には以下の情報が含まれる。

- デバイス名 (例: `iPhone 15 Pro Max`)
- UDID (ユニーク ID)
- 状態 (`Shutdown`, `Booted`, `Unavailable` など)

例:

```
== Devices ==
-- iOS 17.5 --
    iPhone 15 Pro Max (12345678-1234-1234-1234-123456789ABC) (Booted)
    iPhone SE (3rd generation) (23456789-2345-2345-2345-23456789ABCD) (Shutdown)
```

## よく使うフィルタリング

### OS を限定して表示
```
xcrun simctl list devices iOS
```
`iOS` / `watchOS` などのプレフィックスを指定すると、対象 OS のセクションのみを出力できる。

### 起動中デバイスのみ表示
```
xcrun simctl list devices booted
```
`booted` キーワードで、現在起動中のシミュレータだけを確認できる。CI やスクリプトでデバイス状態を確認したい場合に便利。

## トラブルシューティング

- コマンドが見つからない場合: `xcode-select --switch` で正しい Xcode を指しているか確認する。
- `Unavailable` 状態のデバイスが大量にある場合: SDK バージョンとの不整合。不要なデバイスを `xcrun simctl delete <UDID>` で削除し、必要なら再インストールする。
- 出力が多すぎる場合: `rg` や `grep` と組み合わせてフィルタリングすると目的のデバイスを素早く見つけられる。
