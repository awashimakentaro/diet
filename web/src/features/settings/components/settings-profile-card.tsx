/**
 * web/src/features/settings/components/settings-profile-card.tsx
 *
 * 【責務】
 * 体格情報と自動計算カードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - 性別、体重、活動量、各ボタンの状態を受け取る。
 *
 * 【やらないこと】
 * - 永続化
 * - 認証操作
 * - 通知設定
 *
 * 【他ファイルとの関係】
 * - use-settings-screen.ts の profile state に依存する。
 */

import type { ChangeEvent, JSX } from 'react';

type ProfileValues = {
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
};

const ROW_SPECS: RowSpec[] = [
  { field: 'currentWeightKg', label: '現在の体重', suffix: 'kg' },
  { field: 'targetWeightKg', label: '目標の体重', suffix: 'kg' },
  { field: 'targetDays', label: '目標達成日数', suffix: '日' },
];

const ACTIVITY_OPTIONS = [
  { value: 'low', label: '低', caption: '座り仕事' },
  { value: 'moderate', label: '中', caption: '立ち仕事' },
  { value: 'high', label: '高', caption: '活発な運動' },
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
      <p className="settings-screen__section-label">体格情報 + 自動計算</p>

      <div className="settings-screen__card settings-screen__card--profile">
        <div className="settings-screen__segmented">
          <button
            className={gender === 'male' ? 'settings-screen__segmented-button settings-screen__segmented-button--active' : 'settings-screen__segmented-button'}
            onClick={() => onGenderChange('male')}
            type="button"
          >
            男性
          </button>
          <button
            className={gender === 'female' ? 'settings-screen__segmented-button settings-screen__segmented-button--active' : 'settings-screen__segmented-button'}
            onClick={() => onGenderChange('female')}
            type="button"
          >
            女性
          </button>
        </div>

        <div className="settings-screen__profile-rows">
          {ROW_SPECS.map((row) => (
            <label className="settings-screen__profile-row" key={row.field}>
              <span>{row.label}</span>
              <div className="settings-screen__profile-input">
                <input
                  inputMode="decimal"
                  onChange={createChangeHandler(row.field)}
                  type="text"
                  value={values[row.field]}
                />
                <em>{row.suffix}</em>
              </div>
            </label>
          ))}
        </div>

        <div className="settings-screen__activity-group">
          <p>運動レベル</p>
          <div className="settings-screen__activity-grid">
            {ACTIVITY_OPTIONS.map((option) => (
              <button
                className={activityLevel === option.value ? 'settings-screen__activity-button settings-screen__activity-button--active' : 'settings-screen__activity-button'}
                key={option.value}
                onClick={() => onActivityChange(option.value)}
                type="button"
              >
                <strong>{option.label}</strong>
                <span>{option.caption}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-screen__split-actions">
          <button className="settings-screen__secondary-button" onClick={onSaveProfile} type="button">
            プロフィール保存
          </button>
          <button className="settings-screen__accent-button" onClick={onRunAutoCalculate} type="button">
            自動計算実行
          </button>
        </div>
      </div>
    </section>
  );
}
