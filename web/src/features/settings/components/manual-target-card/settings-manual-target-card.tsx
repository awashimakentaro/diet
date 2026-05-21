/*
 * 【責務】
 * 手動目標設定カードを描画する。
 */

import type { ChangeEvent, JSX } from 'react';

type ManualTargetValues = {
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type SettingsManualTargetCardProps = {
  values: ManualTargetValues;
  onChange: (field: keyof ManualTargetValues, value: string) => void;
  onSubmit: () => void;
  isSaving: boolean;
  isSaved: boolean;
};

type InputSpec = {
  field: keyof ManualTargetValues;
  label: string;
  suffix: string;
};

const INPUT_SPECS: InputSpec[] = [
  { field: 'kcal', label: 'KCAL', suffix: 'kcal' },
  { field: 'protein', label: 'PROTEIN', suffix: 'g' },
  { field: 'fat', label: 'FAT', suffix: 'g' },
  { field: 'carbs', label: 'CARBS', suffix: 'g' },
];

export function SettingsManualTargetCard({
  values,
  onChange,
  onSubmit,
  isSaving,
  isSaved,
}: SettingsManualTargetCardProps): JSX.Element {
  function createChangeHandler(field: keyof ManualTargetValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onChange(field, event.target.value);
    };
  }

  return (
    <section className="settings-screen__section">
      <div className="settings-screen__section-head">
        <p className="eyebrow">手動目標設定</p>
        <span>このカードの保存ボタンは kcal / PFC 目標だけを更新します。</span>
      </div>


      <div className="settings-screen__card settings-screen__card--manual app-card">
        <div className="settings-screen__target-grid">
          {INPUT_SPECS.map((input) => (
            <label className="settings-screen__metric-field" key={input.field}>
              <span>{input.label}</span>
              <div className="settings-screen__metric-input">
                <input
                  inputMode="decimal"
                  onChange={createChangeHandler(input.field)}
                  type="text"
                  value={values[input.field]}
                />
                <em>{input.suffix}</em>
              </div>
            </label>
          ))}
        </div>

        <button className="settings-screen__primary-button" onClick={onSubmit} type="button">
          {isSaving ? <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" /> : null}
          <span>{isSaving ? '保存中...' : isSaved ? '保存しました。' : '設定を更新する'}</span>
        </button>

      </div>
    </section>
  );
}
