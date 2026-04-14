/* 【責務】
 * Record 画面の解析中ローディング表示を描画する。
 */

import type { JSX } from 'react';

export function RecordWorkspaceLoading(): JSX.Element {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="record-screen__loading-card"
    >
      <div className="record-screen__loading-spinner" />
      <div className="record-screen__loading-copy">
        <p className="record-screen__field-label">analyzing</p>
        <h2 className="record-screen__workspace-title">返答を待っています</h2>
        <p className="record-screen__workspace-copy">
          入力内容と写真を OpenAI に送信して、食事カードを生成しています。
        </p>
      </div>
    </section>
  );
}
