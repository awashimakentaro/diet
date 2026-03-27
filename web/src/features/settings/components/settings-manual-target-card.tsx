/**
 * web/src/features/settings/components/settings-manual-target-card.tsx
 *
 * 【責務】
 * 手動目標設定カードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - settings-screen.tsx から呼ばれる。
 * - 目標値と更新ハンドラを受け取って UI を表示する。
 *
 * 【やらないこと】
 * - 永続化
 * - 自動計算
 * - 通知設定
 *
 * 【他ファイルとの関係】
 * - use-settings-screen.ts の手動目標 state に依存する。
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
}: SettingsManualTargetCardProps): JSX.Element {
  function createChangeHandler(field: keyof ManualTargetValues) {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      onChange(field, event.target.value);
    };
  }

  return (
    <section className="settings-screen__section">
      <p className="eyebrow">手動目標設定</p>


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

        <button className="app-btn app-btn--primary" onClick={onSubmit} type="button">
          設定を更新する
        </button>

      </div>
    </section>
  );
}
