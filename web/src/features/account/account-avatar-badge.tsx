/**
 * web/src/features/account/account-avatar-badge.tsx
 *
 * 【責務】
 * アカウント用の人型アイコン表示を共通化する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - app-top-bar.tsx と account-sheet.tsx から呼ばれる。
 * - サイズ指定に応じて固定の人型アイコンを表示する。
 *
 * 【やらないこと】
 * - DB 読み込み
 * - 保存処理
 * - モーダル制御
 *
 * 【他ファイルとの関係】
 * - web/src/styles/globals.css の account-avatar-badge 系クラスに依存する。
 */

import { UserRound } from 'lucide-react';
import type { JSX } from 'react';

type AccountAvatarBadgeProps = {
  size?: 'compact' | 'large';
};

export function AccountAvatarBadge({
  size = 'compact',
}: AccountAvatarBadgeProps): JSX.Element {
  const className = size === 'large'
    ? 'account-avatar-badge account-avatar-badge--large'
    : 'account-avatar-badge';

  return (
    <div aria-label="account avatar" className={className} role="img" title="account avatar">
      <UserRound size={size === 'large' ? 32 : 18} strokeWidth={2.3} />
    </div>
  );
}
