# 01_schema.task.md

## 1. 目的
- v1 で利用するローカルデータ構造を完全に定義し、すべてのエージェントと画面が共有する前提を揃える。
- 物理削除ポリシー（docs/design.md）に沿い、履歴 = 唯一の一次情報という思想をコード化する。

## 2. ストレージ方針
- v1 はローカル（AsyncStorage or SQLite 相当）で完結。API 通信は AnalyzeAgent の AI 呼び出しのみ想定。
- すべてのデータは JSON シリアライズ可能な構造に限定し、UTC ISO8601 で日時を保存。
- ID は `uuid v4` 文字列。履歴とライブラリで独立採番する。

## 3. エンティティ定義

### 3.1 Meal（履歴）
| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| `id` | string | ✓ | meal 固有 ID |
| `recordedAt` | string | ✓ | ISO8601。保存ボタン押下時刻。日付切替はこの値で行う |
| `menuName` | string | ✓ | 編集可能なメニュー名 |
| `originalText` | string | ✓ | ユーザー入力（テキスト or 解析結果要約） |
| `items` | FoodItem[] | ✓ | 含まれる食品カード配列 |
| `totals` | Macro | ✓ | items から再計算した合計 kcal/P/F/C |
| `source` | `'text' | 'image' | 'manual' | 'library'` | ✓ | 生成元トレース |
| `notes` | string | - | 任意メモ（v1 UI には露出しないが拡張余地として確保） |

`FoodItem`
- `id`: string
- `name`: string
- `category`: `'dish' | 'ingredient' | 'unknown'`
- `amount`: string（自由記述）
- `kcal`: number
- `protein`: number
- `fat`: number
- `carbs`: number

`Macro`
- `kcal`, `protein`, `fat`, `carbs`: number

### 3.2 FoodLibraryEntry（食品ライブラリ）
| フィールド | 型 | 必須 | 説明 |
| `id` | string | ✓ | ライブラリ固有 ID |
| `label` | string | ✓ | UI 表示名（カードタイトル） |
| `type` | `'single' | 'menu'` | ✓ | 単品 or 複合 |
| `items` | FoodItem[] | ✓ | `type='single'` の場合も配列長 1 に統一 |
| `defaultMenuName` | string | - | `type='menu'` で Record へ送るベース名 |
| `tags` | string[] | - | 検索用タグ |
| `updatedAt` | string | ✓ | ISO8601 |

### 3.3 Goal
| フィールド | 型 | 必須 | 説明 |
| `id` | string | ✓ | 固定で `daily` でも可 |
| `kcal` `protein` `fat` `carbs` | number | ✓ | 目標値 |
| `source` | `'manual' | 'auto'` | ✓ | 入力経路 |
| `calculatedFromProfile` | ProfileSnapshot? | - | 自動計算時に使用したプロフィールを記録 |
| `updatedAt` | string | ✓ |

`ProfileSnapshot`
- `gender`: `'male' | 'female' | 'other'`
- `age`: number
- `heightCm`: number
- `currentWeightKg`: number
- `targetWeightKg`: number
- `targetWeeks`: number
- `activityLevel`: `'low' | 'moderate' | 'high'`

### 3.4 Profile
- `gender`, `birthDate`, `heightCm`, `currentWeightKg`, `targetWeightKg`, `targetDate`（ISO8601）, `activityLevel`, `createdAt`, `updatedAt`。
- BirthDate から年齢を動的算出。GoalAgent で利用するため `Profile` と `ProfileSnapshot` を分離する。

### 3.5 NotificationSetting
| フィールド | 型 | 説明 |
| `enabled` | boolean | 0時通知 ON/OFF |
| `lastScheduledAt` | string | 最終スケジュール時刻 |
| `timezone` | string | `Intl.DateTimeFormat().resolvedOptions().timeZone` |

### 3.6 DerivedSummary（キャッシュ任意）
- `date`: `YYYY-MM-DD`
- `totals`: Macro
- v1 は meals 集計から瞬時に算出できるため、キャッシュは任意。SummaryAgent で計算する実装が望ましい。

## 4. データライフサイクル
1. AnalyzeAgent が暫定 Meal Draft を返す（保存前）。
2. SaveMealAgent が Draft を `Meal` に正規化して永続化。
3. HistoryAgent / FoodsAgent が Meal / Library を CRUD。
4. SummaryAgent が `Meal` を集計し UI に返す。二次情報のみ。
5. GoalAgent は ProfileAgent の情報を利用して `Goal` を更新。
6. NotificationAgent は Goal + Summary を読んで通知本文を構築。

## 5. バリデーション
- すべての number は 0 以上。負値を受けた場合は 0 にクリップして保存。
- `items` の配列は 1 以上。空の場合は保存禁止（RecordScreen で警告）。
- `menuName` `label` は trim 後 1 文字以上。
- 日付操作は `recordedAt` の UTC をローカルタイムゾーン変換して日単位フィルタリングする。

## 6. マイグレーション
- v1 は初期リリースのためマイグレーション不要。将来拡張に備え `schemaVersion: 1` を AsyncStorage に保持しておくと安全。

## 7. 完了条件
- 上記スキーマを TypeScript 型で表現し、共通 `constants/schema.ts` 等に配置できる状態にする。
- 各エージェント task ではここで定義したフィールド名をそのまま利用し、矛盾がないか確認すること。
