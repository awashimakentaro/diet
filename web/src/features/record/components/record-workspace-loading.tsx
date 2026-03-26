/**
 * web/src/features/record/components/record-workspace-loading.tsx
 *
 * 【責務】
 * Record 画面で解析中のローディング表示を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-screen.tsx から呼ばれる。
 * - prompt 解析中に workspace の待機表示として描画される。
 *
 * 【やらないこと】
 * - API 通信
 * - フォーム state 更新
 * - 画面遷移
 *
 * 【他ファイルとの関係】
 * - web/src/styles/globals.css の record-screen__loading-* 系クラスに依存する。
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
        <h2 className="record-screen__workspace-title">カードを生成しています</h2>
        <p className="record-screen__workspace-copy">
          入力内容から食事名と推定カロリー、PFC をまとめています。
        </p>
      </div>
    </section>
  );
}
