<!--
codex-figma-mcp-oauth.md

【責務】
Codex CLI で Figma MCP を OAuth 連携する手順と詰まりポイントを記録する。

【使用されるエージェント / 処理フロー】
- 開発メモ参照エージェント（MCP 連携・認証トラブル時）

【やらないこと】
- Figma API の詳細仕様の解説
- Figma MCP の機能一覧や活用例の網羅
- GUI 版 Codex の起動手順の詳細

【他ファイルとの関係】
- `memo/` 配下の他メモと並列に参照される。
-->

# Codex CLI × Figma MCP（OAuth 連携メモ）

## 前提
- Codex CLI は `~/.codex/config.toml` を参照する。
- Figma MCP は `streamable_http` 接続で動作する。

## うまくいかなかった原因（再発防止）
- `FIGMA_OAUTH_TOKEN` に Figma の Personal Access Token を入れても MCP では通らない。
- `launchctl setenv` は GUI 向けで、CLI 起動の `codex` には効かない。
- `rmcp_client` は v0.92.0 では無効（`Unknown feature flag: rmcp_client`）。

## 最終的に通った手順（OAuth）
### 1. config を OAuth 用に整える
`~/.codex/config.toml` の Figma セクションはこれだけにする（`bearer_token_env_var` を削除）。
```
[mcp_servers.figma]
url = "https://mcp.figma.com/mcp"
http_headers = { "X-Figma-Region" = "us-east-1" }
```

### 2. ログインし直す
```
codex mcp logout figma
codex mcp login figma
```
- 表示された URL をブラウザで開いて認可する。

### 3. Codex を起動
```
codex
```

### 4. 確認
```
codex mcp list
codex mcp get figma
```

## トラブルシューティング
- `The figma MCP server is not logged in` が出る
  - `codex mcp logout figma` → `codex mcp login figma` を再実行する。
  - ブラウザ認可フローが最後まで完了したか確認する。
- `Unknown feature flag: rmcp_client`
  - `rmcp_client` を使わない（v0.92.0 では不要）。
- bearer token で運用したい場合
  - Figma MCP で使えるのは OAuth アクセストークン想定。PAT では通らない可能性が高い。
