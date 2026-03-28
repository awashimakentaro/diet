/**
 * web/src/features/account/account-sheet.tsx
 *
 * 【責務】
 * 画面下部からせり上がるアカウント編集シート UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - app-top-bar.tsx から呼ばれる。
 * - use-account-sheet.ts の state とハンドラを表示へ反映する。
 *
 * 【やらないこと】
 * - DB 直接操作
 * - 認証状態の保持
 * - 体格情報の編集
 *
 * 【他ファイルとの関係】
 * - account-avatar-badge.tsx を利用する。
 * - web/src/styles/globals.css の account-sheet 系クラスに依存する。
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LogOut, Save, UserRound } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

import { AccountAvatarBadge } from './account-avatar-badge';

type AccountSheetProps = {
  email: string;
  avatarValue: string | null;
  isOpen: boolean;
  isLoadingProfile: boolean;
  isSaving: boolean;
  feedbackMessage: string | null;
  values: {
    username: string;
    displayName: string;
    bio: string;
    avatarValue: string | null;
  };
  onClose: () => void;
  onValueChange: (field: 'username' | 'displayName' | 'bio', value: string) => void;
  onAvatarSelect: (value: string) => void;
  onSave: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

const AVATAR_OPTIONS = ['emoji:🍽️', 'emoji:🥗', 'emoji:🔥', 'emoji:🏃', 'emoji:💪', 'emoji:🌿'] as const;

const FIELD_SPECS = [
  { field: 'username', label: 'USERNAME', placeholder: 'diet_runner' },
  { field: 'displayName', label: '表示名', placeholder: 'Yuta' },
  { field: 'bio', label: 'ひとこと', placeholder: '脂質を抑えて減量中' },
] as const;

function getAvatarLabel(value: string): string {
  return value.slice('emoji:'.length);
}

export function AccountSheet({
  email,
  avatarValue,
  isOpen,
  isLoadingProfile,
  isSaving,
  feedbackMessage,
  values,
  onClose,
  onValueChange,
  onAvatarSelect,
  onSave,
  onSignOut,
}: AccountSheetProps): JSX.Element | null {
  function createChangeHandler(field: 'username' | 'displayName' | 'bio') {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onValueChange(field, event.target.value);
    };
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="account-sheet"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <button
            aria-label="アカウント編集を閉じる"
            className="account-sheet__backdrop"
            onClick={onClose}
            type="button"
          />

          <motion.section
            animate={{ y: 0 }}
            className="account-sheet__panel"
            exit={{ y: '100%' }}
            initial={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          >
            <div className="account-sheet__handle" />

            <div className="account-sheet__header">
              <div>
                <p className="account-sheet__eyebrow">ACCOUNT</p>
                <h2>アカウントを編集</h2>
                <p className="account-sheet__copy">トップバーのアイコンと公開プロフィールの基本情報をここで更新できます。</p>
              </div>

              <button className="account-sheet__close" onClick={onClose} type="button">
                閉じる
              </button>
            </div>

            <div className="account-sheet__hero">
              <AccountAvatarBadge avatarValue={avatarValue} fallbackEmail={email} size="large" />
              <div className="account-sheet__hero-copy">
                <strong>{values.displayName.trim() || '表示名を設定'}</strong>
                <span>{email}</span>
              </div>
            </div>

            <section className="account-sheet__section">
              <div className="account-sheet__section-head">
                <UserRound size={16} strokeWidth={2.1} />
                <span>アイコンを選ぶ</span>
              </div>

              <div className="account-sheet__avatar-grid">
                {AVATAR_OPTIONS.map((option) => (
                  <button
                    className={values.avatarValue === option ? 'account-sheet__avatar-option account-sheet__avatar-option--active' : 'account-sheet__avatar-option'}
                    key={option}
                    onClick={() => onAvatarSelect(option)}
                    type="button"
                  >
                    {getAvatarLabel(option)}
                  </button>
                ))}
              </div>
            </section>

            <section className="account-sheet__section">
              <div className="account-sheet__section-head">
                <ArrowRight size={16} strokeWidth={2.1} />
                <span>プロフィール基本情報</span>
              </div>

              <div className="account-sheet__field-list">
                {FIELD_SPECS.map((field) => (
                  <label className="account-sheet__field" key={field.field}>
                    <span>{field.label}</span>
                    <input
                      onChange={createChangeHandler(field.field)}
                      placeholder={field.placeholder}
                      type="text"
                      value={values[field.field]}
                    />
                  </label>
                ))}
              </div>
            </section>

            <div className="account-sheet__footer">
              <div className="account-sheet__feedback">
                {isLoadingProfile ? '読み込み中...' : feedbackMessage ?? ' '}
              </div>

              <div className="account-sheet__actions">
                <button
                  className="account-sheet__secondary-action"
                  onClick={() => {
                    void onSignOut();
                  }}
                  type="button"
                >
                  <LogOut size={16} strokeWidth={2.1} />
                  <span>ログアウト</span>
                </button>

                <button
                  className="account-sheet__primary-action"
                  disabled={isSaving || isLoadingProfile}
                  onClick={() => {
                    void onSave();
                  }}
                  type="button"
                >
                  {isSaving ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Save size={16} strokeWidth={2.1} />}
                  <span>{isSaving ? '保存中...' : '変更を保存'}</span>
                </button>
              </div>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
