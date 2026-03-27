-- prisma/migrations/0003_add_user_profiles/migration.sql
--
-- 【責務】
-- settings 保存と将来のプロフィール共有に必要な user_profiles テーブルを追加する。
--
-- 【使用されるエージェント / 処理フロー】
-- Settings 画面がプロフィール入力を保存する。
-- 将来の公開プロフィール画面や共有導線が参照する。
--
-- 【やらないこと】
-- 既存ユーザーへの username 自動採番
-- goals への自動反映
-- UI 描画
--
-- 【他ファイルとの関係】
-- prisma/schema.prisma の UserProfile モデルと対応する。
-- docs/current-schema.sql に現行構造として反映する。

CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL,
    username text NOT NULL,
    display_name text,
    bio text,
    avatar_url text,
    gender text,
    age integer,
    height_cm numeric,
    current_weight_kg numeric,
    target_weight_kg numeric,
    target_days integer,
    activity_level text,
    is_profile_public boolean NOT NULL DEFAULT false,
    is_body_metrics_public boolean NOT NULL DEFAULT false,
    is_goals_public boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT user_profiles_username_key UNIQUE (username)
);

CREATE INDEX idx_user_profiles_username
    ON public.user_profiles (username);
