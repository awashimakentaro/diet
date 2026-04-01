/**
 * web/src/features/account/api/save-account-profile.ts
 *
 * 【責務】
 * アカウント編集シートの公開プロフィール項目を user_profiles へ保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-account-sheet.ts から呼ばれる。
 * - username / 表示名 / ひとことだけを upsert する。
 *
 * 【やらないこと】
 * - 体格情報の更新
 * - goals 保存
 * - UI 描画
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用する。
 * - settings/api/get-user-profile.ts と同じ user_profiles テーブルを扱う。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type SaveAccountProfileParams = {
  username: string;
  displayName: string;
  bio: string;
};

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
}

export async function saveAccountProfile({
  username,
  displayName,
  bio,
}: SaveAccountProfileParams): Promise<void> {
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
}
