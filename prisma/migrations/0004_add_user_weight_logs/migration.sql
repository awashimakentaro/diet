-- prisma/migrations/0004_add_user_weight_logs/migration.sql
--
-- 【責務】
-- プロフィール更新時の体重推移を保存する user_weight_logs テーブルを追加する。
--
-- 【使用されるエージェント / 処理フロー】
-- Settings / Onboarding のプロフィール保存時に履歴として追記される。
-- Home が体重推移グラフの表示に利用する。
--
-- 【やらないこと】
-- 既存プロフィールからの過去データ補完
-- UI 描画
-- goals の更新
--
-- 【他ファイルとの関係】
-- prisma/schema.prisma の UserWeightLog モデルと対応する。
-- docs/current-schema.sql に現行構造として反映する。

CREATE TABLE public.user_weight_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    recorded_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    current_weight_kg numeric NOT NULL,
    target_weight_kg numeric,
    CONSTRAINT user_weight_logs_pkey PRIMARY KEY (id),
    CONSTRAINT user_weight_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE INDEX idx_user_weight_logs_user_recorded_at
    ON public.user_weight_logs (user_id, recorded_at DESC);
