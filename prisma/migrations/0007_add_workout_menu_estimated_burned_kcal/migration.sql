-- 【責務】
-- 筋トレメニューカードへ保存済み消費カロリー推定値を追加する。

ALTER TABLE public.workout_menus
ADD COLUMN estimated_burned_kcal numeric;
