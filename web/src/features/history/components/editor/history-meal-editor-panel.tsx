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
 * - shared/meal-editor の食品追加導線 UI を再利用する。
 */

import { CheckCircle2, Salad, X } from 'lucide-react';
import type { JSX } from 'react';

import type { WebMeal } from '@/domain/web-diet-schema';
import { MealEditorItemList, MealItemAddPanel } from '@/features/shared/meal-editor/components';
import { useHistoryMealEditor } from '../../hooks';
import type { HistoryMealEditorFormValues } from '../../schemas/history-meal-editor-form-schema';

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
          <MealEditorItemList
            fieldIdPrefix="history"
            itemFields={itemFields}
            mode="manual"
            onRemoveItem={handleRemoveItem}
            register={form.register}
          />

          <MealItemAddPanel
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
