# 00_read_this_first.task.md

## 1. 目的
- Diet App v1 の全タスクの前提条件を 1 箇所に集約し、作業順序を明示する。
- agents.md / requirements.md / design.md / ui-design.md の読み落としを防ぐ。
- 以降の task ファイルが参照する共通語彙（meal, goal, library など）を定義する。

## 2. 必読ドキュメント
1. `AGENTS.md`（最上位規約）
2. `docs/requirements.md`（機能仕様）
3. `docs/design.md`（データ思想 / 削除方針）
4. `docs/ui-design.md`（画面スケッチ）
5. 本 `tasks/` ディレクトリの番号順ファイル

> どのコードファイルでも **冒頭ヘッダコメント + 関数コメントの徹底** が必須。疑問点は推測せず質問すること。

## 3. 作業順序（概要）
| 番号 | ファイル | 目的 |
| --- | --- | --- |
| 01 | schema | データ構造と保存ポリシーを確定 |
| 02 | analyze_agent | 入力解析エージェントの契約定義 |
| 03 | save_meal_agent | 保存処理と正規化フローの定義 |
| 04 | history_agent | 日別履歴の CRUD 契約 |
| 05 | food_library_agent | ライブラリ (Foods) 機能の仕様化 |
| 06 | summary_agent | サマリー算出方法 |
| 07 | goal_agent | 目標保存と自動計算 |
| 08 | profile_agent | 体格情報の保持 |
| 09 | notification_agent | 0時通知フロー |
| 10 | record_screen | 記録タブ UI と状態遷移 |
| 11 | history_screen | 履歴タブ UI |
| 12 | foods_screen | 食品タブ UI |
| 13 | settings_screen | 設定タブ UI |

## 4. 作業ルール（抜粋）
- 各タスク完了時に **入力・出力・副作用** を明文化する。
- SRP 遵守のため、1 ファイル 1 責務、1 関数 1 処理を必ず守る。
- 例外や TODO 禁止。未決事項はタスク内「要検討」で明示する。
- 仕様変更や補足は該当 task ファイルに追記し、他 task と矛盾しないよう整合をとる。

## 5. 完了条件
- 01〜13 の task ファイルがすべて埋まり、読み手が単独で実装判断できる。
- 各ファイルは Markdown（日本語）で記述し、箇条書き / 表 / 擬似コードを活用して AI が解析しやすい構造にする。
- 仕様の齟齬を見つけた場合は `AGENTS.md` 更新を最優先で検討する。
