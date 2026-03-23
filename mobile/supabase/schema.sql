-- Supabase schema for Diet App
-- この SQL は Supabase SQL Editor にそのまま貼り付けて実行してください。

CREATE TABLE public.foods (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    amount text NOT NULL,
    calories numeric NOT NULL,
    protein numeric NOT NULL,
    fat numeric NOT NULL,
    carbs numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    CONSTRAINT foods_pkey PRIMARY KEY (id),
    CONSTRAINT foods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.goals (
    user_id uuid NOT NULL,
    calories numeric NOT NULL,
    protein numeric NOT NULL,
    fat numeric NOT NULL,
    carbs numeric NOT NULL,
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT goals_pkey PRIMARY KEY (user_id),
    CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.meals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    original_text text NOT NULL,
    foods jsonb NOT NULL,
    total jsonb NOT NULL,
    timestamp timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    inserted_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    menu_name text NOT NULL,
    CONSTRAINT meals_pkey PRIMARY KEY (id),
    CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.notification_preferences (
    user_id uuid NOT NULL,
    notify_at_midnight boolean NOT NULL DEFAULT true,
    push_token text,
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT notification_preferences_pkey PRIMARY KEY (user_id),
    CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
