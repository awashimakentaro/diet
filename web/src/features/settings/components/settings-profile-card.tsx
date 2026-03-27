/**
 * web/src/features/settings/components/settings-profile-card.tsx
 *
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

const ROW_SPECS: RowSpec[] = [
  { field: 'username', label: 'USERNAME', suffix: '', icon: <IdCard size={16} strokeWidth={2} />, inputMode: 'text' },
  { field: 'displayName', label: '表示名', suffix: '', icon: <User size={16} strokeWidth={2} />, inputMode: 'text' },
  { field: 'bio', label: 'ひとこと', suffix: '', icon: <NotebookPen size={16} strokeWidth={2} />, inputMode: 'text' },
  { field: 'age', label: '年齢', suffix: '歳', icon: <User size={16} strokeWidth={2} /> },
  { field: 'heightCm', label: '身長', suffix: 'cm', icon: <Ruler size={16} strokeWidth={2} /> },
  { field: 'currentWeightKg', label: '現在の体重', suffix: 'kg', icon: <Weight size={16} strokeWidth={2} /> },
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

  return (
    <section className="settings-screen__section">
      <p className="eyebrow">体格情報 + 自動計算</p>

      <div className="settings-screen__card settings-screen__card--profile app-card">
        {/* Gender Segmented Control */}
        <div className="profile-gender-picker">
          <button
            className={gender === 'male' ? 'profile-gender-picker__btn profile-gender-picker__btn--active' : 'profile-gender-picker__btn'}
            onClick={() => onGenderChange('male')}
            type="button"
          >
            <span className="profile-gender-picker__emoji">👨</span>
            <span>男性</span>
          </button>
          <button
            className={gender === 'female' ? 'profile-gender-picker__btn profile-gender-picker__btn--active' : 'profile-gender-picker__btn'}
            onClick={() => onGenderChange('female')}
            type="button"
          >
            <span className="profile-gender-picker__emoji">👩</span>
            <span>女性</span>
          </button>
        </div>

        {/* Profile Input Fields */}
        <div className="profile-fields">
          {ROW_SPECS.map((row) => (
            <div className="profile-field" key={row.field}>
              <div className="profile-field__icon">{row.icon}</div>
              <label className="profile-field__label">{row.label}</label>
              <div className="profile-field__input-wrapper">
                <input
                  className={row.inputMode === 'text' ? 'profile-field__input profile-field__input--text' : 'profile-field__input'}
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
          ))}
        </div>

        {/* Activity Level */}
        <div className="profile-activity">
          <p className="profile-activity__label">
            <Flame size={14} strokeWidth={2.2} />
            <span>運動レベル</span>
          </p>

          <div className="profile-activity__grid">
            {ACTIVITY_OPTIONS.map((option) => (
              <button
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

        {/* Action Buttons */}
        <div className="profile-actions">
          <button
            className="profile-actions__btn profile-actions__btn--calc"
            onClick={onRunAutoCalculate}
            type="button"
          >
            <Calculator size={16} strokeWidth={2.2} />
            <span>目標を自動計算</span>
          </button>
          <button
            className="profile-actions__btn profile-actions__btn--save"
            onClick={onSaveProfile}
            type="button"
          >
            <Save size={16} strokeWidth={2.2} />
            <span>プロフィールを保存</span>
          </button>
        </div>
      </div>
    </section>
  );
}
