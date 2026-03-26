/**
 * web/src/features/record/components/record-workspace-placeholder.tsx
 *
 * 【責務】
 * Record 画面右側ワークスペースの空状態を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - record-screen.tsx から呼ばれる。
 * - 手動入力またはプロンプト反映前の案内を表示する。
 *
 * 【やらないこと】
 * - 入力 state 管理
 * - API 通信
 * - 画面遷移
 *
 * 【他ファイルとの関係】
 * - web/src/styles/globals.css の record-screen__workspace-* 系クラスに依存する。
 */

import { Sparkles, SquarePen } from 'lucide-react';
import type { JSX } from 'react';

export function RecordWorkspacePlaceholder(): JSX.Element {
  return (
    <section className="record-screen__workspace-placeholder">
      <div className="record-screen__workspace-placeholder-head">
        <p className="record-screen__field-label">workspace</p>
        <h2 className="record-screen__workspace-title">下書きカードの表示エリア</h2>
        <p className="record-screen__workspace-copy">
          左のプロンプト入力からテキストや写真を送ると、解析結果をここにまとめて表示します。
          手動入力を選ぶと、空のカードから直接編集できます。
        </p>
      </div>

      <div className="record-screen__workspace-guides">
        <article className="record-screen__workspace-guide">
          <Sparkles size={18} strokeWidth={2.2} />
          <div>
            <strong>プロンプト実行後</strong>
            <p>食事名と食品候補がまとまったカードを表示して、必要な修正だけ行う想定です。</p>
          </div>
        </article>

        <article className="record-screen__workspace-guide">
          <SquarePen size={18} strokeWidth={2.2} />
          <div>
            <strong>手動入力</strong>
            <p>空のカードを開いて、食事名・分量・PFC をゼロから入力します。</p>
          </div>
        </article>
      </div>
    </section>
  );
}
