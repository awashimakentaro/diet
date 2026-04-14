 'use client';

/**
 * web/src/features/history/components/history-meal-editor-panel.tsx
 *
 * 【責務】
 * History 画面で選択した食事を再編集するオーバーレイパネルを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/history/_components/history-page-screen.tsx から呼ばれる。
 * - 対象 meal をフォームへ展開し、保存時に親へ編集値を返す。
 * - prompt 追加時は record/api/request-record-analysis.ts を呼び、食品候補を追記する。
 *
 * 【やらないこと】
 * - DB 更新
 * - 履歴一覧の再取得
 * - ルート遷移
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebMeal 型を入力として利用する。
 * - record の編集系 CSS クラスを再利用する。
 * - record/components/record-item-add-panel.tsx を追加導線 UI として再利用する。
 */

import { CheckCircle2, Salad, X } from 'lucide-react';
import type { JSX } from 'react';

import type { WebMeal } from '@/domain/web-diet-schema';
import { RecordItemAddPanel } from '@/features/record/components/editor/record-item-add-panel';
import { useHistoryMealEditor } from '../hooks/use-history-meal-editor';
import type { HistoryMealEditorFormValues } from '../schemas/history-meal-editor-form-schema';

type HistoryMealEditorPanelProps = {
  meal: WebMeal;
  isSaving: boolean;
  onClose: () => void;
  onSave: (values: HistoryMealEditorFormValues) => Promise<void>;
};

export function HistoryMealEditorPanel({
  meal,
  isSaving,
  onClose,
  onSave,
}: HistoryMealEditorPanelProps): JSX.Element {
  const {
    form,
    itemFields,
    isAnalyzing,
    feedbackMessage,
    attachments,
    handleAttachmentChange,
    handleRemoveAttachment,
    handleSave,
    handleApplyPrompt,
    handleAddManualItem,
    handlePhotoRecord,
    handleRemoveItem,
  } = useHistoryMealEditor({
    meal,
    onSave,
  });

  return (
    <div className="history-screen__editor-backdrop">
      <section className="history-screen__editor-panel">
        <div className="record-screen__editor-topbar">
          <div>
            <p className="record-screen__field-label">履歴を編集</p>
            <h2 className="record-screen__editor-title">食事内容を編集</h2>
          </div>
          <button
            aria-label="編集パネルを閉じる"
            className="record-screen__editor-close"
            onClick={onClose}
            type="button"
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        <div className="record-screen__field-group">
          <label className="record-screen__field-label" htmlFor="history-meal-name">
            食事の名称
          </label>
          <div className="record-screen__name-field">
            <Salad className="record-screen__name-icon" size={18} strokeWidth={2.1} />
            <input
              className="record-screen__name-input"
              id="history-meal-name"
              placeholder="例: パワーランチ"
              type="text"
              {...form.register('mealName')}
            />
          </div>
        </div>

        <div className="record-screen__field-group">
          <label className="record-screen__field-label">内訳の詳細</label>
          <div className="record-screen__item-stack record-screen__item-stack--manual">
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
                      onClick={() => handleRemoveItem(index)}
                      type="button"
                    >
                      <X size={16} strokeWidth={2.4} />
                    </button>
                  ) : null}
                </div>

                <div className="record-screen__split-fields">
                  <div className="record-screen__mini-field">
                    <label htmlFor={`history-amount-${index}`}>分量</label>
                    <input
                      id={`history-amount-${index}`}
                      placeholder="1人前"
                      type="text"
                      {...form.register(`items.${index}.amount`)}
                    />
                  </div>
                  <div className="record-screen__mini-field">
                    <label htmlFor={`history-kcal-${index}`}>カロリー</label>
                    <div className="record-screen__unit-field">
                      <input
                        id={`history-kcal-${index}`}
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
            onAddManualItem={handleAddManualItem}
            onApplyPrompt={handleApplyPrompt}
            onPhotoRecord={handlePhotoRecord}
            promptRegistration={form.register('prompt')}
            attachments={attachments}
            onAttachmentChange={handleAttachmentChange}
            onRemoveAttachment={handleRemoveAttachment}
          />

          {feedbackMessage !== null ? (
            <p className="record-screen__feedback">{feedbackMessage}</p>
          ) : null}

          <button
            className={isSaving ? 'record-screen__confirm-button record-screen__confirm-button--loading' : 'record-screen__confirm-button'}
            disabled={isSaving}
            onClick={() => {
              void handleSave();
            }}
            type="button"
          >
            {isSaving ? (
              <>
                <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
                <span>保存中です...</span>
              </>
            ) : (
              <>
                <span>編集内容を保存する</span>
                <CheckCircle2 size={20} strokeWidth={2.2} />
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
