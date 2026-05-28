/*
 * 【責務】
 * Settings 画面のアカウント表示情報カードを描画する。
 */

import { IdCard, NotebookPen, Save, User } from 'lucide-react';
import type { ChangeEvent, JSX, ReactNode } from 'react';

import type { ProfileValues } from '../../types';

type SettingsAccountProfileCardProps = {
  values: ProfileValues;
  isSaving: boolean;
  isSaved: boolean;
  onChange: (field: keyof ProfileValues, value: string) => void;
  onSubmit: () => void;
};

type AccountRowSpec = {
  field: keyof ProfileValues;
  label: string;
  icon: ReactNode;
};

const ACCOUNT_ROW_SPECS: AccountRowSpec[] = [
  { field: 'username', label: 'USERNAME', icon: <IdCard size={16} strokeWidth={2} /> },
  { field: 'displayName', label: '表示名', icon: <User size={16} strokeWidth={2} /> },
  { field: 'bio', label: 'ひとこと', icon: <NotebookPen size={16} strokeWidth={2} /> },
];

export function SettingsAccountProfileCard({
  values,
  isSaving,
  isSaved,
  onChange,
  onSubmit,
}: SettingsAccountProfileCardProps): JSX.Element {
  function createChangeHandler(field: keyof ProfileValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onChange(field, event.target.value);
    };
  }

  return (
    <section className="settings-screen__section">
      <div className="settings-screen__section-head">
        <p className="eyebrow">アカウント表示情報</p>
        <span>Home や共有表示で使う名前とひとことを設定します。</span>
      </div>

      <div className="settings-screen__card app-card">
        <div className="profile-fields">
          {ACCOUNT_ROW_SPECS.map((row) => {
            const inputId = `settings-account-profile-${row.field}`;

            return (
              <div className="profile-field" key={row.field}>
                <div className="profile-field__icon">{row.icon}</div>
                <label className="profile-field__label" htmlFor={inputId}>{row.label}</label>
                <div className="profile-field__input-wrapper">
                  <input
                    className="profile-field__input profile-field__input--text"
                    id={inputId}
                    inputMode="text"
                    onChange={createChangeHandler(row.field)}
                    type="text"
                    value={values[row.field]}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="settings-screen__primary-button"
          onClick={onSubmit}
          type="button"
        >
          {isSaving ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Save size={16} strokeWidth={2.2} />}
          <span>{isSaving ? '保存中...' : isSaved ? '保存しました。' : '表示情報を保存'}</span>
        </button>
      </div>
    </section>
  );
}
