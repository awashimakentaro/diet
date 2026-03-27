/**
 * web/src/features/settings/save-user-profile.ts
 *
 * 【責務】
 * Settings 画面のプロフィール入力を user_profiles テーブルへ upsert 保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-settings-screen.ts から呼ばれる。
 * - username と体格情報を認証ユーザーに紐づけて保存する。
 *
 * 【やらないこと】
 * - UI 描画
 * - goals 保存
 * - 自動計算
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient と append-user-weight-log.ts を利用する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

import { appendUserWeightLog } from './append-user-weight-log';

type Gender = 'male' | 'female';
type ActivityLevel = 'low' | 'moderate' | 'high';

type SaveUserProfileParams = {
  username: string;
  displayName: string;
  bio: string;
  gender: Gender;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDays: number;
  activityLevel: ActivityLevel;
};

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export async function saveUserProfile({
  username,
  displayName,
  bio,
  gender,
  age,
  heightCm,
  currentWeightKg,
  targetWeightKg,
  targetDays,
  activityLevel,
}: SaveUserProfileParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername.length < 3) {
    throw new Error('username は 3 文字以上で入力してください。');
  }

  const payload = {
    user_id: userId,
    username: normalizedUsername,
    display_name: displayName.trim() || null,
    bio: bio.trim() || null,
    gender,
    age,
    height_cm: heightCm,
    current_weight_kg: currentWeightKg,
    target_weight_kg: targetWeightKg,
    target_days: targetDays,
    activity_level: activityLevel,
  };

  const { error } = await client.from('user_profiles').upsert(payload, {
    onConflict: 'user_id',
  });

  if (error) {
    if (error.message.includes('user_profiles_username_key')) {
      throw new Error('その username はすでに使われています。');
    }

    throw new Error(error.message);
  }

  await appendUserWeightLog({
    userId,
    currentWeightKg,
    targetWeightKg,
  });
}
