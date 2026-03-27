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
import { SkeletonLine } from '@/components/app-skeleton';

export function RecordWorkspaceLoading(): JSX.Element {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="record-screen__editor-shell record-screen__loading-shell"
    >
      <div className="record-screen__editor">
        <div className="record-screen__editor-topbar">
          <div style={{ display: 'grid', gap: 10 }}>
            <SkeletonLine width="86px" height="10px" />
            <SkeletonLine width="188px" height="28px" />
          </div>
          <SkeletonLine width="36px" height="36px" borderRadius="14px" />
        </div>

        <div className="record-screen__editor-body">
          <div className="record-screen__field-group">
            <SkeletonLine width="72px" height="10px" />
            <SkeletonLine width="100%" height="68px" borderRadius="24px" />
          </div>

          <div className="record-screen__field-group">
            <SkeletonLine width="84px" height="10px" />
            <SkeletonLine width="100%" height="56px" borderRadius="20px" />
          </div>

          <div className="record-screen__field-group">
            <SkeletonLine width="72px" height="10px" />

            <div className="record-screen__draft-summary">
              <SkeletonLine width="108px" height="24px" borderRadius="10px" />
              <SkeletonLine width="62px" height="24px" borderRadius="10px" />
              <SkeletonLine width="62px" height="24px" borderRadius="10px" />
              <SkeletonLine width="62px" height="24px" borderRadius="10px" />
            </div>

            <div className="record-screen__item-stack record-screen__item-stack--generated">
              {Array.from({ length: 2 }).map((_, index) => (
                <article className="record-screen__item-card" key={index}>
                  <div className="record-screen__item-header">
                    <SkeletonLine width="32px" height="32px" borderRadius="14px" />
                    <SkeletonLine width="140px" height="18px" />
                    <div style={{ marginLeft: 'auto' }}>
                      <SkeletonLine width="28px" height="28px" borderRadius="999px" />
                    </div>
                  </div>

                  <div className="record-screen__split-fields">
                    <div className="record-screen__mini-field">
                      <SkeletonLine width="44px" height="10px" />
                      <SkeletonLine width="100%" height="44px" borderRadius="16px" />
                    </div>
                    <div className="record-screen__mini-field">
                      <SkeletonLine width="52px" height="10px" />
                      <SkeletonLine width="100%" height="44px" borderRadius="16px" />
                    </div>
                  </div>

                  <div className="record-screen__macro-edit-grid">
                    {Array.from({ length: 3 }).map((__, macroIndex) => (
                      <div className="record-screen__macro-edit" key={macroIndex}>
                        <SkeletonLine width="100%" height="20px" borderRadius="10px" />
                        <SkeletonLine width="100%" height="44px" borderRadius="16px" />
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <SkeletonLine width="100%" height="64px" borderRadius="40px" />
            <SkeletonLine width="100%" height="60px" borderRadius="24px" />
          </div>
        </div>
      </div>
    </section>
  );
}
