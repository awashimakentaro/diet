# 13_settings_screen.task.md

## 1. 画面目的
- 目標手動設定、体格情報入力 + 自動計算、0 時通知トグルを 1 画面で提供する。
- GoalAgent / ProfileAgent / NotificationAgent を操作する唯一の UI。

## 2. UI セクション
1. **現在の目標サマリー**
   - GoalAgent.getGoal() を表示。
   - 「編集」ボタンで手動フォームを開く。
2. **手動目標フォーム**
   - kcal / P / F / C の number input。
   - 保存 → `GoalAgent.setManualGoal`。
3. **体格情報 + 自動計算**
   - Profile フォーム（性別, 生年月日, 身長, 現体重, 目標体重, 目標達成日, 活動レベル）。
   - 「計算」ボタン → `GoalAgent.calculateGoalFromProfile`。
   - 結果プレビュー + 「反映」ボタンで `applyCalculatedGoal`。
4. **通知設定**
   - トグルスイッチ + 状態説明。
   - ON: Permission → NotificationAgent.updateSchedule。
   - OFF: NotificationAgent.cancelAll。

## 3. 状態管理
```ts
type SettingsState = {
  goal: Goal;
  profileForm: ProfileInput;
  manualForm: Macro;
  notification: NotificationSetting;
  calcResult?: CalculatedGoal;
  loading: boolean;
  error?: string;
};
```
- `manualForm` は Goal 現値を初期値にする。
- `profileForm` は ProfileAgent から取得した値をマージ。

## 4. フロー
1. 画面初期化
   - GoalAgent / ProfileAgent / NotificationAgent から値を取得。
2. 手動保存
   - 入力値バリデーション → `setManualGoal` → toast。
3. 自動計算
   - Profile 保存 → `calculateGoalFromProfile` → プレビュー表示。
   - 反映ボタン → `applyCalculatedGoal` → SummaryAgent invalidate。
4. 通知
   - トグル ON → permission → updateSchedule（失敗時は OFF に戻す）。
   - トグル OFF → cancelAll。

## 5. バリデーション / UX
- 数値入力はステッパー + 直接入力両対応。
- 計算結果は小数 1 桁で表示し、差分を色付きバーで示す。
- 通知権限拒否時は CTA を表示し、設定アプリへの導線を案内。

## 6. 依存
- `06_summary_agent`（目標変更後に RecordScreen を更新するため invalidate）
- `07_goal_agent`, `08_profile_agent`, `09_notification_agent`

## 7. 完了条件
- 設定タブで Goal/Profile/Notification の CRUD が完結し、他画面からは設定値の参照のみで済む。
