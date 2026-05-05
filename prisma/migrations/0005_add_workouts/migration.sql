-- 【責務】
-- 筋トレメニューと実施記録を保存する workout テーブルを追加する。

CREATE TABLE public.workout_menus (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    exercise_name text NOT NULL,
    sets integer NOT NULL,
    reps integer NOT NULL,
    weight_kg numeric NOT NULL,
    duration_minutes integer NOT NULL,
    intensity text NOT NULL,
    note text,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT workout_menus_pkey PRIMARY KEY (id),
    CONSTRAINT workout_menus_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.workout_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    menu_id uuid,
    menu_name text NOT NULL,
    exercise_name text NOT NULL,
    sets integer NOT NULL,
    reps integer NOT NULL,
    weight_kg numeric NOT NULL,
    duration_minutes integer NOT NULL,
    intensity text NOT NULL,
    burned_kcal numeric NOT NULL,
    note text,
    performed_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT workout_logs_pkey PRIMARY KEY (id),
    CONSTRAINT workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT workout_logs_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.workout_menus(id) ON DELETE SET NULL
);

CREATE INDEX idx_workout_menus_user_created_at
    ON public.workout_menus (user_id, created_at DESC);

CREATE INDEX idx_workout_logs_user_performed_at
    ON public.workout_logs (user_id, performed_at DESC);
