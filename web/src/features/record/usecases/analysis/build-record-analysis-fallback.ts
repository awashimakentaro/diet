/* 【責務】
 AI 解析に失敗したときでも、画面上に最低限の下書きを残す場所
 ユーザーがプロンプトを入れたのに meal 名が空のままだと、画面が何も反応していないように見えるので、プロンプトから簡易的な食事名を作る。
 items.0.name が空なら、プロンプトの先頭語を入れて、最低限「何の食事か」が見えるようにする。
 draftOriginalText を保持する 解析に失敗しても、ユーザーが入力したプロンプト自体は失わずに残す。
 */
type BuildRecordAnalysisFallbackParams = {
    prompt: string;
    currentMealName: string;
    currentFirstItemName: string;
    currentOriginalText: string;
};

type RecordAnalysisFallback = {
    nextMealName: string | null;
    nextFirstItemName: string | null;
    nextOriginalText: string;
};

function buildMealNameFromPrompt(prompt: string): string {
    const compact = prompt.replace(/\s+/g, ' ').trim();

    if (compact.length === 0) {
        return '';
    }

    return compact.length <= 18 ? compact : `${compact.slice(0, 18)}…`;
}

function buildFirstItemNameFromPrompt(prompt: string): string {
    return prompt.split(/[、,\s]+/).filter(Boolean)[0] ?? '';
}

function buildNextOriginalText(currentOriginalText: string, prompt: string): string {
    if (prompt.length === 0) {
        return currentOriginalText;
    }

    if (currentOriginalText.trim().length > 0) {
        return `${currentOriginalText}\n${prompt}`;
    }

    return prompt;
}

export function buildRecordAnalysisFallback({//fallbackした時に仮のカードを生成できるようにする
    prompt,
    currentMealName,
    currentFirstItemName,
    currentOriginalText,
}: BuildRecordAnalysisFallbackParams): RecordAnalysisFallback {
    const trimmedPrompt = prompt.trim();

    return {
        nextMealName://もしもfallbackした時に、mealNameが空なら、promptの先頭語を入れて、最低限「何の食事か」が見えるようにする。
            trimmedPrompt.length > 0 && currentMealName.trim().length === 0
                ? buildMealNameFromPrompt(trimmedPrompt)
                : null,
        nextFirstItemName:
            trimmedPrompt.length > 0
                && currentFirstItemName.trim().length === 0
                && buildFirstItemNameFromPrompt(trimmedPrompt).length > 0
                ? buildFirstItemNameFromPrompt(trimmedPrompt)
                : null,
        nextOriginalText: buildNextOriginalText(currentOriginalText, trimmedPrompt),
    };
}