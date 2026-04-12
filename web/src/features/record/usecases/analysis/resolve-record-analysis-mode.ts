/* 【責務】
 * Record の解析結果を追記するか置換するか判定する。
 * 生成されたカードや手入力カードが、すでに「有効な下書き」と言えるなら追加する
 * まだ空に近く、下書きとして成立していないなら、追加ではなく全体を差し替える
 */

type WorkspaceMode = 'idle' | 'manual' | 'generated';

type ResolveRecordAnalysisModeParams = {
    workspaceMode: WorkspaceMode;
    mealName: string;
    items: Array<{ name: string }>;
};

export function resolveRecordAnalysisMode({
    workspaceMode,
    mealName,
    items,
}: ResolveRecordAnalysisModeParams): 'append' | 'replace' { //この ): 'append' | 'replace' は、の関数は戻り値として'append' か 'replace' のどちらかだけを返します.という意味
    const hasMeaningfulDraft =
        workspaceMode !== 'idle'
        && (
            mealName.trim().length > 0
            || items.some((item) => item.name.trim().length > 0)
        );

    return hasMeaningfulDraft ? 'append' : 'replace';
}