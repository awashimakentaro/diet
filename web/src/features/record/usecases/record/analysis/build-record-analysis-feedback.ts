/* 【責務】
 * Record の解析結果に対するフィードバックメッセージを生成する。
 */

type BuildRecordAnalysisFeedbackParams = {
    warning: string | null;
    analysisMode: 'append' | 'replace';
    hasAttachments: boolean;
}

export function buildRecordAnalysisFeedback({
    warning,
    analysisMode,
    hasAttachments,
}: BuildRecordAnalysisFeedbackParams): { message: string; tone: 'info' | 'error' } {
    if (warning) {
        return { message: warning, tone: 'error' };
    }

    if (analysisMode === 'append') {
        return { message: 'AI が推定した食品候補を既存カードへ追加しました。', tone: 'info' };
    }
    if (hasAttachments) {
        return {message: 'AI が写真から推定した栄養情報を下書きカードへ反映しました。', tone: 'info'};
    }

    return { message: 'AI が推定した栄養情報を下書きカードへ反映しました。', tone: 'info' };
}