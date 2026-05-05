-- 【責務】
-- 筋トレとその他ワークアウトを区別する種別を追加する。

ALTER TABLE public.workout_menus
ADD COLUMN workout_kind text NOT NULL DEFAULT 'strength';

ALTER TABLE public.workout_logs
ADD COLUMN workout_kind text NOT NULL DEFAULT 'strength';
