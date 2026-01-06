# Diet App

  AI 解析を活用して食事記録と栄養管理をシンプルにする React Native (Expo) アプリです。テキスト/画像入力からメニューを生成し、PFC バランスと目標値との差分を即時に把握できます。

  ## Quick Links

  - [要件仕様 `docs/requirements.md`](docs/requirements.md)
  - [設計思想 `docs/design.md`](docs/design.md)
  - [UI ラフ `docs/ui-design.md`](docs/ui-design.md)
  - [再インストール手順 `docs/reinstall.md`](docs/reinstall.md)
  - [開発規約 `AGENTS.md`](AGENTS.md)

  ## Product Overview

  - **目的**: 食事の記録・AI 解析・1 日の栄養サマリー可視化・お気に入りメニューの再利用。
  - **ターゲット**: v1 は個人利用中心。将来的なユーザーアカウント・通知サーバー化を許容する設計。
  - **プラットフォーム**: Expo Router を用いた React Native (iOS 優先、Android/Web 拡張を想定)。
  - **データ思想**: 履歴(`meals`)が唯一の一次情報。サマリーは常に履歴から算出し、食品データはテンプレ用途。
  - **削除ポリシー**: すべて物理削除。Undo やゴミ箱は導入しない。

  ## Tabs & Core Features

  ### Record
  - 当日の合計 kcal / P / F / C と目標差分バー。
  - テキスト入力・画像入力（カメラ）。AI は JSON のみ返却し、仮メニュー + 食品カード群を生成。
  - 保存前に menu_name / original_text / 食品カード / amount / PFC を自由編集。
  - 保存すると履歴へ即反映し、入力は初期化。

  ### History
  - 日付切替で選択日の履歴だけを表示。
  - メニューカード (menu_name, original_text, 食品一覧, 合計 PFC, 記録時刻)。
  - メニュー単位の編集 / 削除 / 食品保存、および当日分の一括削除。
  - 編集後は合計値を再計算して表示。

  ### Foods
  - 単品食品と複数食品メニューを一元管理。検索・追加・編集・削除をサポート。
  - 「今日食べた」で即履歴に追加（編集なし）。

  ### Settings
  - kcal / P / F / C の手動設定。
  - 性別/年齢/身長/体重/目標/期間/活動量を入力し、目標値を自動計算して反映。
  - 0 時の過不足通知トグル。

  ## Architecture & Agents

  - AnalyzeAgent: テキスト/画像を解析し、食品構成 JSON を生成。正確性より速度重視で仮生成→ユーザー修正を前提。
  - SaveMealAgent / HistoryAgent / FoodLibraryAgent / SummaryAgent / GoalAgent / NotificationAgent が SRP を満たすよう責務分割。
  - 将来的な `user_id` 分離や Push 通知サーバー化を見据えて依存を局所化。
  - すべての削除は物理削除。複雑な履歴管理やバージョン管理は導入しない。

  ## Getting Started

  ```bash
  # 依存関係をインストール
  npm install

  # 開発サーバー
  npx expo start

  # ネイティブ実機 / シミュレーター
  npm run ios   # iOS
  npm run android

  # Web プレビュー
  npm run web

  # Lint
  npm run lint

  - エントリーポイントは expo-router/entry。app/ 以下はファイルベースルーティング。
  - TypeScript + Expo SDK 54 / React Native 0.81.5 / React 19.1。

  ## Release & Reinstall (Free Apple ID)

  docs/reinstall.md に従い、7 日ごとに Release Run で署名を更新します。

  1. npx expo export --platform ios で dist/ を生成。
  2. ios/Diet.xcodeproj を開き、実機 + Release Scheme + Personal Team を設定。
  3. Archive は不要。Run (▶︎) で Release ビルドを転送。
  4. 初回は iPhone 設定 > 一般 > VPN とデバイス管理から開発者を信頼。
  5. 有効期限切れ時は手順 1–3 を繰り返すだけで再インストール完了。

  ## Project Structure

  app/            Expo Router ルート + 各タブ画面
  agents/         ドメインエージェント (SRP 厳守のロジック群)
  components/     共通 UI・パーツ
  hooks/, lib/    カスタムフック・サービス層
  supabase/       データアクセスと設定
  scripts/        開発補助スクリプト
  docs/           仕様・設計・運用ドキュメント

  ## Conventions

  - AGENTS.md と agents.md の規約に従い、1 ファイル 1 責務・全関数への日本語ドキュメントコメント付与を徹底。
  - SRP を守れない場合は即分割。推測実装は禁止し、不明点は必ず仕様へ還元する。
  - AI 入出力は JSON 厳守。食品推定は編集前提のラフ値でよい。

  ## v1 Completion Checklist

  - 記録 → 編集 → 保存 → 履歴反映までの一連フロー。
  - 履歴の編集 / 削除 / 当日一括削除。
  - 食品タブでの保存・再利用。
  - 目標設定（手動 & 自動計算）。
  - 当日サマリー表示と 0 時通知。
  - iOS Release ビルドを 7 日ごとに再署名できる。

  ———