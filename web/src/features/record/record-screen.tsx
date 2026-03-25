'use client';

/**
 * web/src/features/record/record-screen.tsx
 *
 * 【責務】
 * Record 画面全体のトップバー、サマリー、入力、編集、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/record/page.tsx から呼ばれる。
 * - use-record-screen.ts の state と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - ルート保護
 *
 * 【他ファイルとの関係】
 * - components 配下の record UI コンポーネントを利用する。
 * - use-record-screen.ts に依存する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { RecordEditorPanel } from './components/record-editor-panel';
import { RecordQuickInputCard } from './components/record-quick-input-card';
import { RecordSummaryCard } from './components/record-summary-card';
import { useRecordScreen } from './use-record-screen';

export function RecordScreen(): JSX.Element {
  const {
    form,
    itemFields,
    dailySummary,
    draftTotals,
    feedbackMessage,
    handleApplyPrompt,
    handlePhotoRecord,
    handleAddItem,
    handleRemoveItem,
    handleConfirmDraft,
  } = useRecordScreen();

  return (
    <div className="record-screen">
      <AppTopBar />

      <main className="record-screen__main">
        <div className="record-screen__sidebar">
          <RecordSummaryCard summary={dailySummary} />

          <RecordQuickInputCard
            onApplyPrompt={handleApplyPrompt}
            onPhotoRecord={handlePhotoRecord}
            promptRegistration={form.register('prompt')}
          />
        </div>

        <div className="record-screen__workspace">
          <RecordEditorPanel
            draftTotals={draftTotals}
            feedbackMessage={feedbackMessage}
            form={form}
            itemFields={itemFields}
            onAddItem={handleAddItem}
            onConfirm={handleConfirmDraft}
            onRemoveItem={handleRemoveItem}
          />
        </div>
      </main>

      <AppBottomNav currentPath="/app/record" />
    </div>
  );
}
