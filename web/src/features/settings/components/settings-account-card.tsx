/**
 * web/src/features/settings/components/settings-account-card.tsx
 *
 * 【責務】
 * アカウント情報、使い方導線、ログアウトボタンを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - 現在ユーザー情報とログアウトハンドラを受け取る。
 *
 * 【やらないこと】
 * - 認証状態の取得
 * - 永続化
 * - 通知設定
 *
 * 【他ファイルとの関係】
 * - useWebAuth の user / signOut を表示用途で利用する。
 */

import { BadgeCheck } from 'lucide-react';
import type { JSX } from 'react';

type SettingsAccountCardProps = {
  email: string;
  isSigningOut: boolean;
  onOpenTutorial: () => void;
  onSignOut: () => void;
};

export function SettingsAccountCard({
  email,
  isSigningOut,
  onOpenTutorial,
  onSignOut,
}: SettingsAccountCardProps): JSX.Element {
  return (
    <section className="settings-screen__section">
      <p className="eyebrow">アカウント</p>

      <div className="settings-screen__card settings-screen__card--account app-card">
        <div className="settings-screen__account-row">
          <div className="settings-screen__account-avatar">
            <BadgeCheck size={18} strokeWidth={2} />
          </div>

          <div className="settings-screen__account-copy">
            <span>ログイン中</span>
            <strong>{email}</strong>
          </div>
        </div>

        <button className="app-btn app-btn--secondary" onClick={onOpenTutorial} type="button">
          使い方を見る
        </button>

        <button className="app-btn app-btn--secondary" disabled={isSigningOut} onClick={onSignOut} type="button">
          {isSigningOut ? (
            <>
              <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
              <span>ログアウト中...</span>
            </>
          ) : (
            'ログアウト'
          )}
        </button>
      </div>
    </section>
  );
}
