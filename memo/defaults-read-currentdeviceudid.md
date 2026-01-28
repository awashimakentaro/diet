<!--
defaults-read-currentdeviceudid.md

【責務】
macOS の `defaults read com.apple.iphonesimulator CurrentDeviceUDID` コマンドの意味と使用方法、関連情報の入手先を整理する。

【使用されるエージェント / 処理フロー】
- 開発メモ参照エージェント (シミュレータ関連タスク時)

【やらないこと】
- コマンドを自動実行するスクリプト提供
- 他ドメインの `defaults` キー一覧化
- Apple シミュレータ全体の設定管理

【他ファイルとの関係】
- `memo/` ディレクトリ内の他コマンド解説と並列に参照される。
-->

# `defaults read com.apple.iphonesimulator CurrentDeviceUDID` とは

macOS の `defaults` コマンドを使って、Simulator アプリ (`com.apple.iphonesimulator`) のユーザーデフォルトから `CurrentDeviceUDID` というキーの値を読み出すためのコマンド。`CurrentDeviceUDID` は Simulator の UI 上で最後に選択・起動したデバイスの UDID（UUID 形式）を記録している。

- `defaults read`: 指定したドメインの設定値を表示するサブコマンド
- `com.apple.iphonesimulator`: Simulator.app のバンドル ID を用いた設定ドメイン
- `CurrentDeviceUDID`: 現在選択状態のシミュレータデバイスを表すキー

出力される UDID は `xcrun simctl boot <UDID>` や `xcrun simctl install <UDID> <app>` など、他の `simctl` コマンドを即座に実行したいときに利用できる。

## 実行例と応用
```
$ defaults read com.apple.iphonesimulator CurrentDeviceUDID
149C2884-0610-49FB-8BA2-A957880C6976
```

- CI スクリプトで「最後に操作したデバイス」を再利用する際の参照元になる。
- 複数デバイスの UDID から特定のものを選び直す手間を減らす。
- 出力が空の場合、Simulator を一度起動し任意のデバイスを選択することで値が書き込まれる。

## どこで情報を入手できるか（AI なしの場合）
- `man defaults`: `defaults` コマンド全体の使用方法とオプションが掲載。各サブコマンドの書式はここで確認できる。
- `defaults domains`: 利用可能なドメイン一覧を取得できる。Simulator 関連を探す際に使用。
- `defaults read com.apple.iphonesimulator`: キー一覧がすべて出力されるので、`grep CurrentDeviceUDID` などで目的のキーを探せる。
- Apple Developer Documentation / Xcode Release Notes: Simulator の設定キーや動作が記載されることがある。
- Xcode メニュー「Window > Devices and Simulators」: UDID を GUI で確認し、コマンド出力と見比べることでキーの意味を把握できる。

## トラブルシューティング
- `Domain com.apple.iphonesimulator does not exist`: Simulator を一度も起動していない、または環境から削除されている。Xcode から simulator を起動すればドメインが生成される。
- 複数の Xcode バージョンを切り替えている場合は `xcode-select -p` の結果を確認し、想定の Simulator が参照されているかをチェックする。
- UDID が古く使用できなくなった場合は Simulator のデバイスリストから該当デバイスを削除し、再度作成して値を更新する。
