/**
 * web/src/features/foods/components/food-entry-editor-panel.tsx
 *
 * 【責務】
 * Foods 画面で食品ライブラリカードの編集 UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/foods/_components/foods-page-screen.tsx から呼ばれる。
 * - use-foods-screen.ts のフォーム状態を受け取り、食品カード編集 UI を構築する。
 *
 * 【やらないこと】
 * - API 通信
 * - 一覧取得
 * - 画面遷移
 *
 * 【他ファイルとの関係】
 * - record-screen と同系統の CSS クラスを利用して見た目を揃える。
 */

'use client';

import { CheckCircle2, Salad, X } from 'lucide-react';
import type { JSX } from 'react';
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form';

import type { RecordFormValues } from '@/features/record/schemas/record-form-schema';

type FoodEntryEditorPanelProps = {
  form: UseFormReturn<RecordFormValues>;
  itemFields: FieldArrayWithId<RecordFormValues, 'items', 'id'>[];
  draftTotals: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  isSaving: boolean;
  feedbackMessage: string | null;
  feedbackTone: 'info' | 'error';
  onAddItem: () => void;
  onClose: () => void;
  onRemoveItem: (index: number) => void;
  onConfirm: () => void;
};

export function FoodEntryEditorPanel({
  form,
  itemFields,
  draftTotals,
  isSaving,
  feedbackMessage,
  feedbackTone,
  onAddItem,
  onClose,
  onRemoveItem,
  onConfirm,
}: FoodEntryEditorPanelProps): JSX.Element {
  return (
    <div className="foods-screen__editor-backdrop">
      <section className="foods-screen__editor-panel">
        <div className="record-screen__editor-topbar">
          <div>
            <p className="record-screen__field-label">foods editor</p>
            <h2 className="record-screen__editor-title">食品カードを編集</h2>
          </div>

          <button
            aria-label="食品編集パネルを閉じる"
            className="record-screen__editor-close"
            onClick={onClose}
            type="button"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div className="record-screen__editor-body">
          <div className="record-screen__field-group">
            <label className="record-screen__field-label" htmlFor="food-entry-name">
              食品カード名
            </label>
            <div className="record-screen__name-field">
              <Salad className="record-screen__name-icon" size={18} strokeWidth={2.1} />
              <input
                className="record-screen__name-input"
                id="food-entry-name"
                placeholder="例: 高たんぱく朝食"
                type="text"
                {...form.register('mealName')}
              />
            </div>
          </div>

          <div className="record-screen__field-group">
            <label className="record-screen__field-label">内訳の詳細</label>

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

            <div className="record-screen__item-stack record-screen__item-stack--generated">
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
                      <label htmlFor={`foods-amount-${index}`}>分量</label>
                      <input
                        id={`foods-amount-${index}`}
                        placeholder="1人前"
                        type="text"
                        {...form.register(`items.${index}.amount`)}
                      />
                    </div>
                    <div className="record-screen__mini-field">
                      <label htmlFor={`foods-kcal-${index}`}>カロリー</label>
                      <div className="record-screen__unit-field">
                        <input
                          id={`foods-kcal-${index}`}
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

            <button
              className="record-screen__add-button"
              onClick={onAddItem}
              type="button"
            >
              <span>食品を追加する</span>
            </button>

            {feedbackMessage !== null ? (
              <p
                className={
                  feedbackTone === 'error'
                    ? 'record-screen__feedback record-screen__feedback--error'
                    : 'record-screen__feedback'
                }
              >
                {feedbackMessage}
              </p>
            ) : null}

            <button
              className={isSaving ? 'record-screen__confirm-button record-screen__confirm-button--loading' : 'record-screen__confirm-button'}
              disabled={isSaving}
              onClick={onConfirm}
              type="button"
            >
              {isSaving ? (
                <>
                  <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
                  <span>保存中です...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} strokeWidth={2.4} />
                  <span>この内容で保存する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
