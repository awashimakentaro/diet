-- prisma/migrations/0002_add_daily_summaries/migration.sql
--
-- 【責務】
-- daily_summaries テーブルと集計クエリ向けインデックスを追加する。
--
-- 【使用されるエージェント / 処理フロー】
-- SummaryAgent が日次集計の保存先として利用する。
-- Home / History / Notification が軽量な日次集計を読む前提を整える。
--
-- 【やらないこと】
-- 過去 meals の自動バックフィル
-- UI 描画
-- アプリ側ロジック実装
--
-- 【他ファイルとの関係】
-- prisma/schema.prisma と対応する差分 migration である。
-- mobile/supabase/migrations/20260326_add_daily_summaries.sql と同内容で管理する。

CREATE TABLE public.daily_summaries (
    user_id uuid NOT NULL,
    date date NOT NULL,
    kcal numeric NOT NULL DEFAULT 0,
    protein numeric NOT NULL DEFAULT 0,
    fat numeric NOT NULL DEFAULT 0,
    carbs numeric NOT NULL DEFAULT 0,
    meal_count integer NOT NULL DEFAULT 0,
    top_foods jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT daily_summaries_pkey PRIMARY KEY (user_id, date),
    CONSTRAINT daily_summaries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_foods_user_created_at
    ON public.foods (user_id, created_at DESC);

CREATE INDEX idx_meals_user_timestamp
    ON public.meals (user_id, timestamp DESC);

CREATE INDEX idx_daily_summaries_user_updated_at
    ON public.daily_summaries (user_id, updated_at DESC);
