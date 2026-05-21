/*
 * 【責務】
 * 共有用プロフィール項目と体格情報、自動計算カードを描画する。
 */

import {
  Calculator,
  Flame,
  Goal,
  IdCard,
  NotebookPen,
  Ruler,
  Save,
  Timer,
  User,
  Weight,
} from 'lucide-react';
import type { ChangeEvent, JSX, ReactNode } from 'react';

type ProfileValues = {
  username: string;
  displayName: string;
  bio: string;
  age: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  targetDays: string;
};

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

type SettingsProfileCardProps = {
  gender: Gender;
  values: ProfileValues;
  activityLevel: ActivityLevel;
  isSavingProfile: boolean;
  isSavedProfile: boolean;
  isSavingAuto: boolean;
  isSavedAuto: boolean;
  onGenderChange: (value: Gender) => void;
  onValueChange: (field: keyof ProfileValues, value: string) => void;
  onActivityChange: (value: ActivityLevel) => void;
  onSaveProfile: () => void;
  onRunAutoCalculate: () => void;
};

type RowSpec = {
  field: keyof ProfileValues;
  label: string;
  suffix: string;
  icon: ReactNode;
  inputMode?: 'text' | 'decimal';
};

const ACCOUNT_ROW_SPECS: RowSpec[] = [
  { field: 'username', label: 'USERNAME', suffix: '', icon: <IdCard size={16} strokeWidth={2} />, inputMode: 'text' },
  { field: 'displayName', label: '表示名', suffix: '', icon: <User size={16} strokeWidth={2} />, inputMode: 'text' },
  { field: 'bio', label: 'ひとこと', suffix: '', icon: <NotebookPen size={16} strokeWidth={2} />, inputMode: 'text' },
];

const BODY_ROW_SPECS: RowSpec[] = [
  { field: 'age', label: '年齢', suffix: '歳', icon: <User size={16} strokeWidth={2} /> },
  { field: 'heightCm', label: '身長', suffix: 'cm', icon: <Ruler size={16} strokeWidth={2} /> },
  { field: 'currentWeightKg', label: '現在の体重', suffix: 'kg', icon: <Weight size={16} strokeWidth={2} /> },
];

const GOAL_ROW_SPECS: RowSpec[] = [
  { field: 'targetWeightKg', label: '目標の体重', suffix: 'kg', icon: <Goal size={16} strokeWidth={2} /> },
  { field: 'targetDays', label: '目標達成日数', suffix: '日', icon: <Timer size={16} strokeWidth={2} /> },
];

const ACTIVITY_OPTIONS = [
  { value: 'low', label: '低', caption: '座り仕事', emoji: '🪑' },
  { value: 'moderate', label: '中', caption: '立ち仕事', emoji: '🚶' },
  { value: 'high', label: '高', caption: '活発な運動', emoji: '🏃' },
] as const;

export function SettingsProfileCard({
  gender,
  values,
  activityLevel,
  isSavingProfile,
  isSavedProfile,
  isSavingAuto,
  isSavedAuto,
  onGenderChange,
  onValueChange,
  onActivityChange,
  onSaveProfile,
  onRunAutoCalculate,
}: SettingsProfileCardProps): JSX.Element {
  function createChangeHandler(field: keyof ProfileValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onValueChange(field, event.target.value);
    };
  }

  function renderFields(rows: RowSpec[]): JSX.Element {
    return (
      <div className="profile-fields">
        {rows.map((row) => {
          const inputId = `settings-profile-${row.field}`;

          return (
            <div className="profile-field" key={row.field}>
              <div className="profile-field__icon">{row.icon}</div>
              <label className="profile-field__label" htmlFor={inputId}>{row.label}</label>
              <div className="profile-field__input-wrapper">
                <input
                  className={row.inputMode === 'text' ? 'profile-field__input profile-field__input--text' : 'profile-field__input'}
                  id={inputId}
                  inputMode={row.inputMode ?? 'decimal'}
                  onChange={createChangeHandler(row.field)}
                  type="text"
                  value={values[row.field]}
                />
                {row.suffix.length > 0 ? (
                  <span className="profile-field__suffix">{row.suffix}</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="settings-screen__section">
      <div className="settings-screen__section-head">
        <p className="eyebrow">体格情報 + 自動計算</p>
        <span>プロフィール保存と目標の自動計算は別々に実行できます。</span>
      </div>

      <div className="settings-screen__card settings-screen__card--profile app-card">
        <div className="profile-section">
          <p className="profile-section__title">アカウント表示情報</p>
          {renderFields(ACCOUNT_ROW_SPECS)}
        </div>

        <div className="profile-section">
          <p className="profile-section__title">体格情報</p>
          <div className="profile-gender-picker" aria-label="性別">
            <button
              aria-pressed={gender === 'male'}
              className={gender === 'male' ? 'profile-gender-picker__btn profile-gender-picker__btn--active' : 'profile-gender-picker__btn'}
              onClick={() => onGenderChange('male')}
              type="button"
            >
              <span className="profile-gender-picker__emoji">👨</span>
              <span>男性</span>
            </button>
            <button
              aria-pressed={gender === 'female'}
              className={gender === 'female' ? 'profile-gender-picker__btn profile-gender-picker__btn--active' : 'profile-gender-picker__btn'}
              onClick={() => onGenderChange('female')}
              type="button"
            >
              <span className="profile-gender-picker__emoji">👩</span>
              <span>女性</span>
            </button>
          </div>
          {renderFields(BODY_ROW_SPECS)}
        </div>

        <div className="profile-section">
          <p className="profile-section__title">目標条件</p>
          {renderFields(GOAL_ROW_SPECS)}
        </div>

        <div className="profile-section">
          <p className="profile-section__title">運動レベル</p>
          <div className="profile-activity">
            <p className="profile-activity__label">
              <Flame size={14} strokeWidth={2.2} />
              <span>活動量を選択</span>
            </p>

            <div className="profile-activity__grid">
              {ACTIVITY_OPTIONS.map((option) => (
                <button
                  aria-pressed={activityLevel === option.value}
                  className={activityLevel === option.value ? 'profile-activity__btn profile-activity__btn--active' : 'profile-activity__btn'}
                  key={option.value}
                  onClick={() => onActivityChange(option.value)}
                  type="button"
                >
                  <span className="profile-activity__emoji">{option.emoji}</span>
                  <strong>{option.label}</strong>
                  <span className="profile-activity__caption">{option.caption}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="profile-actions__btn profile-actions__btn--calc"
            onClick={onRunAutoCalculate}
            type="button"
          >
            {isSavingAuto ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Calculator size={16} strokeWidth={2.2} />}
            <span>{isSavingAuto ? '保存中...' : isSavedAuto ? '保存しました。' : '目標を自動計算'}</span>
          </button>
          <button
            className="profile-actions__btn profile-actions__btn--save"
            onClick={onSaveProfile}
            type="button"
          >
            {isSavingProfile ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Save size={16} strokeWidth={2.2} />}
            <span>{isSavingProfile ? '保存中...' : isSavedProfile ? '保存しました。' : 'プロフィールを保存'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
