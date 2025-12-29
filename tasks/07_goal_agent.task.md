# 07_goal_agent.task.md

## 1. 目的と責務
- 目標値（kcal / P / F / C）を保存・更新し、SummaryAgent や SettingsScreen に提供する。
- 手動設定と体格情報からの自動計算の両方を統一 API で扱う。

## 2. 提供機能
| 関数 | 説明 |
| --- | --- |
| `getGoal(): Promise<Goal>` | 直近保存された Goal を返す。未設定時はデフォルト 0 |
| `setManualGoal(payload: Macro): Promise<Goal>` | 手入力値を保存し、`source='manual'` |
| `calculateGoalFromProfile(profile: Profile): CalculatedGoal` | BMR 計算と PFC 按分を返す（保存はしない）|
| `applyCalculatedGoal(result: CalculatedGoal): Promise<Goal>` | 計算結果を保存し `source='auto'` |
| `subscribe(listener: () => void): () => void` | Goal 変更検知 |

`CalculatedGoal` には `macro`, `profileSnapshot`, `method` を含める。

## 3. 自動計算ロジック
1. **BMR（Mifflin-St Jeor）**
   - 男性: `10 * weight + 6.25 * height - 5 * age + 5`
   - 女性: `10 * weight + 6.25 * height - 5 * age - 161`
   - その他: 男女の平均を用いる。
2. **TDEE = BMR * activityFactor**
   - low=1.2, moderate=1.375, high=1.55
3. **減量/増量調整**
   - `deltaWeight = targetWeight - currentWeight`
   - `weeklyDelta = deltaWeight / targetWeeks`
   - `calorieAdjustment = weeklyDelta * 7700 / 7`
   - `targetCalories = clamp(TDEE + calorieAdjustment, 1200, 4000)`
4. **PFC 比率**（標準）
   - P: 25% / 4 kcal
   - F: 25% / 9 kcal
   - C: 50% / 4 kcal
   - 小数点 1 桁で四捨五入。

## 4. 保存ルール
- 既存 Goal に上書き保存。履歴は v1 では保持しない。
- 保存後 `SummaryAgent.invalidate(today)` を呼ぶ。
- `calculatedFromProfile` には `Profile` のスナップショットを必ず保存。

## 5. エラーハンドリング
- Profile 情報が不足している場合は `Error('Profile is incomplete')` を投げる。
- `targetWeeks <= 0` の場合は `weeklyDelta` を 0 とみなす。

## 6. 関連タスク
- `01_schema`: Goal / Profile 定義
- `08_profile_agent`: Profile 読み書き
- `06_summary_agent`: Goal 変化を監視
- `13_settings_screen`: UI 操作

## 7. 完了条件
- GoalAgent を通じて手動/自動いずれの目標更新もでき、SummaryAgent が即座に再集計する。
