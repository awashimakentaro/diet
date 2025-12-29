# 08_profile_agent.task.md

## 1. 目的と責務
- SettingsScreen で入力された体格情報を保存・取得し、GoalAgent の自動計算に必要な最新プロフィールを提供する。
- プロフィールは単一レコードで、上書き保存のみ（履歴なし）。

## 2. 提供機能
| 関数 | 説明 |
| --- | --- |
| `getProfile(): Promise<Profile | null>` | 保存済みプロフィールを返す |
| `saveProfile(input: ProfileInput): Promise<Profile>` | UI からの入力を正規化し保存 |
| `toSnapshot(profile: Profile): ProfileSnapshot` | GoalAgent 用に年齢などを計算 |

`ProfileInput`
- `gender: 'male' | 'female' | 'other'`
- `birthDate: string (YYYY-MM-DD)`
- `heightCm`, `currentWeightKg`, `targetWeightKg`: number
- `targetDate`: string
- `activityLevel: 'low' | 'moderate' | 'high'`

## 3. 処理ルール
- `age` は `differenceInYears(targetDate=today, birthDate)` で計算。
- `targetWeeks = max(1, ceil((targetDate - today)/7))`。
- 保存時に `updatedAt` を更新。初回は `createdAt` も保存。

## 4. バリデーション
- `heightCm` 100〜220、`weight` 30〜200 を許容範囲とし外れ値はエラー。
- `targetDate` は `today + 1week` 以上未来であること。
- `targetWeight` は >0。増量/減量いずれも可。

## 5. 関連タスク
- `01_schema`: Profile 定義
- `07_goal_agent`: Snapshot 生成
- `13_settings_screen`: 入力フォーム

## 6. 完了条件
- ProfileAgent から Snapshot を取得するだけで GoalAgent の自動計算に十分な情報が揃う。
