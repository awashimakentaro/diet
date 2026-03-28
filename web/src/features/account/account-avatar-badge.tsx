/**
 * web/src/features/account/account-avatar-badge.tsx
 *
 * 【責務】
 * アカウント用のアイコン表示を共通化する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - app-top-bar.tsx と account-sheet.tsx から呼ばれる。
 * - avatar 値か email を受け取り、表示用ラベルを組み立てる。
 *
 * 【やらないこと】
 * - DB 読み込み
 * - 保存処理
 * - モーダル制御
 *
 * 【他ファイルとの関係】
 * - account-sheet.tsx のアイコン選択結果を表示に反映する。
 * - web/src/styles/globals.css の account-avatar-badge 系クラスに依存する。
 */

import type { JSX } from 'react';

type AccountAvatarBadgeProps = {
  avatarValue: string | null;
  fallbackEmail?: string;
  size?: 'compact' | 'large';
};

function isEmojiAvatar(value: string | null): boolean {
  return typeof value === 'string' && value.startsWith('emoji:');
}

function getEmojiAvatar(value: string | null): string {
  if (isEmojiAvatar(value) === false) {
    return '';
  }

  return value?.slice('emoji:'.length) ?? '';
}

function getInitial(email: string | undefined): string {
  if (!email) {
    return 'G';
  }

  return email.slice(0, 1).toUpperCase();
}

export function AccountAvatarBadge({
  avatarValue,
  fallbackEmail,
  size = 'compact',
}: AccountAvatarBadgeProps): JSX.Element {
  const className = size === 'large'
    ? 'account-avatar-badge account-avatar-badge--large'
    : 'account-avatar-badge';

  return (
    <div
      aria-label={fallbackEmail ?? 'account avatar'}
      className={className}
      role="img"
      title={fallbackEmail ?? 'account avatar'}
    >
      {isEmojiAvatar(avatarValue) ? getEmojiAvatar(avatarValue) : getInitial(fallbackEmail)}
    </div>
  );
}
