-- 【責務】
-- 筋トレメニューと実施記録に複数種目の JSON 配列を追加する。

ALTER TABLE public.workout_menus
ADD COLUMN exercises jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.workout_logs
ADD COLUMN exercises jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.workout_menus
SET exercises = jsonb_build_array(jsonb_build_object(
    'exerciseName', exercise_name,
    'sets', sets,
    'reps', reps,
    'weightKg', weight_kg
))
WHERE exercises = '[]'::jsonb;

UPDATE public.workout_logs
SET exercises = jsonb_build_array(jsonb_build_object(
    'exerciseName', exercise_name,
    'sets', sets,
    'reps', reps,
    'weightKg', weight_kg
))
WHERE exercises = '[]'::jsonb;
