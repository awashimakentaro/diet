/**
 * web/src/features/record/components/record-editor-panel.tsx
 *
 * 【責務】
 * Record 画面の食事名入力、食品内訳編集、確定ボタンを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-screen.tsx から呼ばれる。
 * - RHF form と itemFields を受け取り、下書き編集 UI を構築する。
 *
 * 【やらないこと】
 * - 認証処理
 * - API 通信
 * - ルート遷移
 *
 * 【他ファイルとの関係】
 * - use-record-screen.ts の state とハンドラに依存する。
 */

import { CheckCircle2, Salad, X } from 'lucide-react';
import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormRegisterReturn, UseFormReturn } from 'react-hook-form';

import { RecordItemAddPanel } from './record-item-add-panel';
import type { RecordFormValues } from '../record-form-schema';

type RecordEditorPanelProps = {
  mode: 'manual' | 'generated';
  form: UseFormReturn<RecordFormValues>;
  itemFields: FieldArrayWithId<RecordFormValues, 'items', 'id'>[];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  isAnalyzing: boolean;
  promptRegistration: UseFormRegisterReturn;
  onAddItem: () => void;
  onApplyPrompt: () => void | Promise<void>;
  onPhotoRecord: () => void;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
};

export function RecordEditorPanel({
  mode,
  form,
  itemFields,
  draftTotals,
  isAnalyzing,
  promptRegistration,
  onAddItem,
  onApplyPrompt,
  onPhotoRecord,
  onClose,
  onRemoveItem,
  onConfirm,
}: RecordEditorPanelProps): JSX.Element {
  const title = mode === 'generated' ? '解析結果を確認' : '食事内容を編集';
  const eyebrow = mode === 'generated' ? 'プロンプト結果' : '手動入力';
  const hasSummary = mode === 'generated';

  return (
    <section className="record-screen__editor-shell">
      <div className="record-screen__editor">
        <div className="record-screen__editor-topbar">
          <div>
            <p className="record-screen__field-label">{eyebrow}</p>
            <h2 className="record-screen__editor-title">{title}</h2>
          </div>

          <button
            aria-label="手動入力パネルを閉じる"
            className="record-screen__editor-close"
            onClick={onClose}
            type="button"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div className="record-screen__editor-body">
          <div className="record-screen__field-group">
            <label className="record-screen__field-label" htmlFor="meal-name">
              食事の名称
            </label>
            <div className="record-screen__name-field">
              <Salad className="record-screen__name-icon" size={18} strokeWidth={2.1} />
              <input
                className="record-screen__name-input"
                id="meal-name"
                placeholder="例: パワーランチ"
                type="text"
                {...form.register('mealName')}
              />
            </div>
          </div>

          <div className="record-screen__field-group">
            <label className="record-screen__field-label">内訳の詳細</label>

            {hasSummary ? (
              <div className="record-screen__draft-summary">
                <article className="record-screen__draft-summary-card record-screen__draft-summary-card--kcal">
                  <span>Total</span>
                  <strong>{draftTotals.kcal} kcal</strong>
                </article>
                <article className="record-screen__draft-summary-card">
                  <span>P</span>
                  <strong>{draftTotals.protein}g</strong>
                </article>
                <article className="record-screen__draft-summary-card">
                  <span>F</span>
                  <strong>{draftTotals.fat}g</strong>
                </article>
                <article className="record-screen__draft-summary-card">
                  <span>C</span>
                  <strong>{draftTotals.carbs}g</strong>
                </article>
              </div>
            ) : null}

            <div className={mode === 'generated' ? 'record-screen__item-stack record-screen__item-stack--generated' : 'record-screen__item-stack'}>
              {itemFields.map((field, index) => (
                <article className="record-screen__item-card" key={field.id}>
                  <div className="record-screen__item-header">
                    <div className="record-screen__item-index">{index + 1}</div>
                    <input
                      className="record-screen__item-name"
                      placeholder="食品名"
                      type="text"
                      {...form.register(`items.${index}.name`)}
                    />
                    {itemFields.length > 1 ? (
                      <button
                        aria-label={`食品 ${index + 1} を削除`}
                        className="record-screen__remove-button"
                        onClick={() => onRemoveItem(index)}
                        type="button"
                      >
                        <X size={16} strokeWidth={2.4} />
                      </button>
                    ) : null}
                  </div>

                  <div className="record-screen__split-fields">
                    <div className="record-screen__mini-field">
                      <label htmlFor={`amount-${index}`}>分量</label>
                      <input
                        id={`amount-${index}`}
                        placeholder="1人前"
                        type="text"
                        {...form.register(`items.${index}.amount`)}
                      />
                    </div>
                    <div className="record-screen__mini-field">
                      <label htmlFor={`kcal-${index}`}>カロリー</label>
                      <div className="record-screen__unit-field">
                        <input
                          id={`kcal-${index}`}
                          placeholder="0"
                          type="text"
                          {...form.register(`items.${index}.kcal`)}
                        />
                        <span>kcal</span>
                      </div>
                    </div>
                  </div>

                  <div className="record-screen__macro-edit-grid">
                    <div className="record-screen__macro-edit">
                      <p className="record-screen__macro-chip record-screen__macro-chip--protein">P</p>
                      <div className="record-screen__macro-input">
                        <input
                          placeholder="0"
                          type="text"
                          {...form.register(`items.${index}.protein`)}
                        />
                        <span>g</span>
                      </div>
                    </div>
                    <div className="record-screen__macro-edit">
                      <p className="record-screen__macro-chip record-screen__macro-chip--fat">F</p>
                      <div className="record-screen__macro-input">
                        <input
                          placeholder="0"
                          type="text"
                          {...form.register(`items.${index}.fat`)}
                        />
                        <span>g</span>
                      </div>
                    </div>
                    <div className="record-screen__macro-edit">
                      <p className="record-screen__macro-chip record-screen__macro-chip--carbs">C</p>
                      <div className="record-screen__macro-input">
                        <input
                          placeholder="0"
                          type="text"
                          {...form.register(`items.${index}.carbs`)}
                        />
                        <span>g</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <RecordItemAddPanel
              isAnalyzing={isAnalyzing}
              onAddManualItem={onAddItem}
              onApplyPrompt={onApplyPrompt}
              onPhotoRecord={onPhotoRecord}
              promptRegistration={promptRegistration}
            />
          </div>
        </div>
      </div>

      <footer className="record-screen__confirm-bar">
        <button
          className="record-screen__confirm-button"
          onClick={onConfirm}
          type="button"
        >
          <span>この内容で確定する</span>
          <CheckCircle2 size={20} strokeWidth={2.2} />
        </button>
      </footer>
    </section>
  );
}
