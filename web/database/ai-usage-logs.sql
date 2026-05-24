create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null check (feature in ('meal', 'workout')),
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_user_feature_created_at_idx
  on public.ai_usage_logs (user_id, feature, created_at desc);

alter table public.ai_usage_logs enable row level security;

drop policy if exists "Users can insert own AI usage logs" on public.ai_usage_logs;
create policy "Users can insert own AI usage logs"
  on public.ai_usage_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own AI usage logs" on public.ai_usage_logs;
create policy "Users can read own AI usage logs"
  on public.ai_usage_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  ai_weekly_limit integer not null default 5 check (ai_weekly_limit >= 0),
  ai_meal_daily_limit integer check (ai_meal_daily_limit is null or ai_meal_daily_limit >= 0),
  ai_workout_daily_limit integer check (ai_workout_daily_limit is null or ai_workout_daily_limit >= 0),
  ai_unlimited boolean not null default false,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_entitlements
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro'));

alter table public.user_entitlements
  add column if not exists ai_weekly_limit integer not null default 5 check (ai_weekly_limit >= 0);

alter table public.user_entitlements
  add column if not exists stripe_customer_id text unique;

alter table public.user_entitlements
  add column if not exists stripe_subscription_id text unique;

alter table public.user_entitlements
  add column if not exists subscription_status text;

alter table public.user_entitlements
  add column if not exists current_period_end timestamptz;

alter table public.user_entitlements enable row level security;

drop policy if exists "Users can read own entitlements" on public.user_entitlements;
create policy "Users can read own entitlements"
  on public.user_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 権限の付与・変更は Supabase SQL Editor や管理者用 service role から行う。
-- 例:
-- insert into public.user_entitlements (user_id, role, plan, ai_weekly_limit, ai_unlimited)
-- select id, 'tester', 'pro', 20, false
-- from auth.users
-- where lower(email) = lower('TestUser@test.com')
-- on conflict (user_id) do update
-- set role = excluded.role,
--     plan = excluded.plan,
--     ai_weekly_limit = excluded.ai_weekly_limit,
--     ai_unlimited = excluded.ai_unlimited,
--     updated_at = now();
