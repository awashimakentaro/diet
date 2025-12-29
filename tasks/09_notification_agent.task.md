# 09_notification_agent.task.md

## 1. 目的と責務
- 毎日 0 時に過不足通知をローカル通知で送信する。
- SettingsScreen での ON/OFF を反映し、SummaryAgent + GoalAgent の情報を使って本文を構築する。

## 2. 提供機能
| 関数 | 説明 |
| --- | --- |
| `requestPermission(): Promise<boolean>` | Expo Notifications の権限を要求 |
| `updateSchedule(setting: NotificationSetting, goal: Goal): Promise<void>` | ON/OFF 変更や Goal 更新時に呼ぶ |
| `buildPayload(date: string, summary: Summary): NotificationContent` | 過不足メッセージを生成 |
| `cancelAll(): Promise<void>` | 通知停止 |

`NotificationSetting` は `01_schema` 参照。

## 3. スケジューリング
1. SettingsScreen で ON → `requestPermission` → 許可済みなら `scheduleNotification`。
2. タイムゾーンは `setting.timezone` を使用。日跨ぎを考慮し Expo の `trigger: { hour:0, minute:0, repeats:true }` を利用。
3. OFF の場合は `cancelAll()` を呼んで登録を削除。

## 4. 本文フォーマット
- 例: `本日の摂取: 1800 kcal / P80 F50 C200 (目標との差 +200 kcal)`
- 差分が不足なら `-200 kcal` と表示。
- Diff の絶対値が 50 kcal 未満なら「目標通り」を表示。

## 5. データ依存
- SummaryAgent から `getDailySummary(yesterday)` を取得し、p.m. 0 時時点の前日結果を使う。
- GoalAgent から現在の目標値を取得。目標未設定の場合でも通知本文に `目標未設定` を含めて送信可能。

## 6. エラーハンドリング
- 権限拒否 → 設定を強制的に OFF にし、ユーザーに警告。
- スケジュール API 失敗 → エラーを SettingsScreen で表示し、`lastScheduledAt` を更新しない。

## 7. 関連タスク
- `06_summary_agent`（データ取得）
- `07_goal_agent`（目標変更で再スケジュール）
- `13_settings_screen`（UI 操作）

## 8. 完了条件
- NotificationAgent を通じて ON/OFF 切り替え・権限チェック・スケジュールが一貫して実行される。
