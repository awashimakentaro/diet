/*
 * 【責務】
 * 共有用プロフィール項目、体格情報、目標 kcal / PFC 設定カードを描画する。
 */

import {
  Flame,
  Goal,
  Ruler,
  Save,
  Timer,
  User,
  Weight,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { ChangeEvent, JSX, ReactNode } from 'react';

import type { SettingsValidationErrors } from '../../types';

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

type ManualTargetValues = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type ActivityLevel = 'low' | 'moderate' | 'high';
type Gender = 'male' | 'female';

type SettingsProfileCardProps = {
  gender: Gender;
  values: ProfileValues;
  manualTargets: ManualTargetValues;
  activityLevel: ActivityLevel;
  isSavingProfile: boolean;
  isSavedProfile: boolean;
  validationErrors: SettingsValidationErrors;
  validationFocusRequest: number;
  autoGoalPreview: {
    kcal: number;
    bmr: number;
    estimatedDailyBurnKcal: number;
    dailyCalorieAdjustment: number;
    warning: string | null;
  } | null;
  onGenderChange: (value: Gender) => void;
  onValueChange: (field: keyof ProfileValues, value: string) => void;
  onManualTargetChange: (field: keyof ManualTargetValues, value: string) => void;
  onActivityChange: (value: ActivityLevel) => void;
  onSaveProfile: () => void;
};

type RowSpec = {
  field: keyof ProfileValues;
  label: string;
  suffix: string;
  icon: ReactNode;
  required?: boolean;
  inputMode?: 'text' | 'decimal';
};

const BODY_ROW_SPECS: RowSpec[] = [
  { field: 'age', label: '年齢', suffix: '歳', icon: <User size={16} strokeWidth={2} />, required: true },
  { field: 'heightCm', label: '身長', suffix: 'cm', icon: <Ruler size={16} strokeWidth={2} />, required: true },
  { field: 'currentWeightKg', label: '現在の体重', suffix: 'kg', icon: <Weight size={16} strokeWidth={2} />, required: true },
];

const GOAL_ROW_SPECS: RowSpec[] = [
  { field: 'targetWeightKg', label: '目標の体重', suffix: 'kg', icon: <Goal size={16} strokeWidth={2} />, required: true },
  { field: 'targetDays', label: '目標達成日数', suffix: '日', icon: <Timer size={16} strokeWidth={2} />, required: true },
];

type ManualTargetSpec = {
  field: keyof ManualTargetValues;
  label: string;
  suffix: string;
  required?: boolean;
};

const MANUAL_TARGET_SPECS: ManualTargetSpec[] = [
  { field: 'kcal', label: '食事で1日に摂取したいカロリー', suffix: 'kcal', required: true },
  { field: 'protein', label: 'Protein', suffix: 'g' },
  { field: 'fat', label: 'Fat', suffix: 'g' },
  { field: 'carbs', label: 'Carbs', suffix: 'g' },
];

const ERROR_FOCUS_ORDER = [
  'age',
  'heightCm',
  'currentWeightKg',
  'targetWeightKg',
  'targetDays',
  'kcal',
  'protein',
  'fat',
  'carbs',
] as const;

const ACTIVITY_OPTIONS = [
  { value: 'low', label: '低', caption: '座り仕事', emoji: '🪑' },
  { value: 'moderate', label: '中', caption: '立ち仕事', emoji: '🚶' },
  { value: 'high', label: '高', caption: '活発な運動', emoji: '🏃' },
] as const;

export function SettingsProfileCard({
  gender,
  values,
  manualTargets,
  activityLevel,
  isSavingProfile,
  isSavedProfile,
  validationErrors,
  validationFocusRequest,
  autoGoalPreview,
  onGenderChange,
  onValueChange,
  onManualTargetChange,
  onActivityChange,
  onSaveProfile,
}: SettingsProfileCardProps): JSX.Element {
  const inputRefs = useRef<Partial<Record<string, HTMLInputElement>>>({});
  const validationErrorsRef = useRef(validationErrors);

  useEffect(() => {
    validationErrorsRef.current = validationErrors;
  }, [validationErrors]);

  useEffect(() => {
    const currentErrors = validationErrorsRef.current;
    const firstErrorKey = ERROR_FOCUS_ORDER.find((field) => (
      field in currentErrors.profile
      || field in currentErrors.manualTargets
    ));

    if (firstErrorKey === undefined) {
      return;
    }

    inputRefs.current[firstErrorKey]?.focus();
  }, [validationFocusRequest]);

  function createChangeHandler(field: keyof ProfileValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onValueChange(field, event.target.value);
    };
  }

  function createManualTargetChangeHandler(field: keyof ManualTargetValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onManualTargetChange(field, event.target.value);
    };
  }

  function renderError(message: string | undefined): JSX.Element | null {
    if (message === undefined) {
      return null;
    }

    return <p className="profile-field__error">{message}</p>;
  }

  function renderFields(rows: RowSpec[]): JSX.Element {
    return (
      <div className="profile-fields">
        {rows.map((row) => {
          const inputId = `settings-profile-${row.field}`;

            const errorMessage = validationErrors.profile[row.field];

            return (
              <div
                className={errorMessage === undefined ? 'profile-field' : 'profile-field profile-field--error'}
                key={row.field}
              >
                <div className="profile-field__icon">{row.icon}</div>
                <label className="profile-field__label" htmlFor={inputId}>
                  <span>{row.label}</span>
                  {row.required === true ? <em>必須</em> : null}
                </label>
                <div className="profile-field__input-wrapper">
                <input
                  className={row.inputMode === 'text' ? 'profile-field__input profile-field__input--text' : 'profile-field__input'}
                  id={inputId}
                  inputMode={row.inputMode ?? 'decimal'}
                  onChange={createChangeHandler(row.field)}
                  ref={(element) => {
                    inputRefs.current[row.field] = element ?? undefined;
                  }}
                  type="text"
                  value={values[row.field]}
                />
                {row.suffix.length > 0 ? (
                  <span className="profile-field__suffix">{row.suffix}</span>
                ) : null}
                </div>
                {renderError(errorMessage)}
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
        <span>目標総摂取カロリーは体格情報から自動計算します。食事で1日に摂りたいカロリーは自分で設定します。</span>
      </div>

      <div className="settings-screen__card settings-screen__card--profile app-card">
        <div className="settings-screen__step-heading">
          <span>01</span>
          <strong>身体・目標</strong>
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

        <div className="settings-screen__step-heading">
          <span>02</span>
          <strong>摂取目標</strong>
        </div>

        <div className="profile-section">
          <p className="profile-section__title">1日の目標摂取</p>
          <p className="profile-section__description">
            ここは目標総摂取カロリーではなく、食事だけで1日に摂取したいカロリーです。PFCは入力があればその値を使い、空欄ならこのカロリーに合わせて自動補完します。
          </p>
          <div className="settings-screen__target-grid">
            {MANUAL_TARGET_SPECS.map((input) => (
              <label
                className={
                  validationErrors.manualTargets[input.field] === undefined
                    ? 'settings-screen__metric-field'
                    : 'settings-screen__metric-field settings-screen__metric-field--error'
                }
                key={input.field}
              >
                <span>{input.label}</span>
                {input.required === true ? <b className="settings-screen__required-badge">必須</b> : null}
                <div className="settings-screen__metric-input">
                  <input
                    inputMode="decimal"
                    onChange={createManualTargetChangeHandler(input.field)}
                    ref={(element) => {
                      inputRefs.current[input.field] = element ?? undefined;
                    }}
                    type="text"
                    value={manualTargets[input.field]}
                  />
                  <em>{input.suffix}</em>
                </div>
                {renderError(validationErrors.manualTargets[input.field])}
              </label>
            ))}
          </div>
        </div>

        <div className="settings-screen__step-heading">
          <span>03</span>
          <strong>活動量</strong>
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
            className="profile-actions__btn profile-actions__btn--save"
            onClick={onSaveProfile}
            type="button"
          >
            {isSavingProfile ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : <Save size={16} strokeWidth={2.2} />}
            <span>{isSavingProfile ? '保存中...' : isSavedProfile ? '保存しました。' : 'プロフィールを保存'}</span>
          </button>
        </div>

        {autoGoalPreview !== null ? (
          <div className="profile-auto-preview">
            <div>
              <span>基礎代謝</span>
              <strong>{autoGoalPreview.bmr} kcal</strong>
            </div>
            <div>
              <span>推定消費</span>
              <strong>{autoGoalPreview.estimatedDailyBurnKcal} kcal</strong>
            </div>
            <div>
              <span>目標総摂取カロリー</span>
              <strong>{autoGoalPreview.kcal} kcal</strong>
            </div>
            <div>
              <span>1日の調整</span>
              <strong>{autoGoalPreview.dailyCalorieAdjustment > 0 ? '+' : ''}{autoGoalPreview.dailyCalorieAdjustment} kcal</strong>
            </div>
            {autoGoalPreview.warning !== null ? (
              <p>{autoGoalPreview.warning}</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
