/* 【責務】
 * Record 画面の workspace 空状態を描画する。
 */

import { Ban, Sparkles, SquarePen } from 'lucide-react';
import type { JSX } from 'react';

type RecordWorkspacePlaceholderProps = {
  mealAiLimit: {
    isLoading: boolean;
    used: number;
    limit: number;
    isUnlimited: boolean;
    isReached: boolean;
  };
};

export function RecordWorkspacePlaceholder({
  mealAiLimit,
}: RecordWorkspacePlaceholderProps): JSX.Element {
  if (mealAiLimit.isReached) {
    return (
      <section className="record-screen__workspace-placeholder record-screen__workspace-placeholder--limited">
        <div className="record-screen__workspace-placeholder-head">
          <p className="record-screen__field-label">AI LIMIT</p>
          <h2 className="record-screen__workspace-title">今日のAI解析は上限に達しました</h2>
          <p className="record-screen__workspace-copy">
            無料プランのAI利用は食事・筋トレを合わせて週{mealAiLimit.limit}回までです。次の月曜0:00に回数が復活します。
          </p>
        </div>

        <article className="record-screen__workspace-guide record-screen__workspace-guide--limited">
          <Ban size={18} strokeWidth={2.2} />
          <div>
            <strong>今できること</strong>
            <p>手動入力は引き続き使えます。ProにするとAI利用上限が週20回になります。</p>
          </div>
        </article>
      </section>
    );
  }

  return (
    <section className="record-screen__workspace-placeholder">
      <div className="record-screen__workspace-placeholder-head">
        <p className="record-screen__field-label">workspace</p>
        <h2 className="record-screen__workspace-title">下書きカードの表示エリア</h2>
        <p className="record-screen__workspace-copy">
          下の入力欄からテキストや写真を送ると、解析結果をここにまとめて表示します。
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
