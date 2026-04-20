import { describe, expect, it, vi } from 'vitest';

import { resetRecordDraftAfterSave } from '../reset-record-draft-after-save';

vi.mock('../../get-today-date-key', () => ({
    getTodayDateKey: () => '2026-04-21',
}));

describe('resetRecordDraftAfterSave', () => {
    it('保存後に record 下書きフォームを初期状態へ戻す', () => {
        //arrange
        const setValue = vi.fn();
        //呼び出し履歴を記録できるダミー関数
        const replaceItems = vi.fn();
        //replaceItems の代わり
        const form = {
            setValue,
        } as never;
        //resetRecordDraftAfterSave に渡すための最小限の偽物
        //ここのtestの考え方としては、まずresetRecordDraftAfterSaveじたいはformとreplaceItemを引数にとって、その二つを操作するだけなので、テストでは
        //本物のrhfを使わずよに、呼ばれたか確認できる偽物をおく

        //act
        resetRecordDraftAfterSave({
            form,
            replaceItems,
        });
        //assert
        expect(setValue).toHaveBeenNthCalledWith(1, 'prompt', '', { shouldDirty: false });
        expect(setValue).toHaveBeenNthCalledWith(2, 'recordedDate', '2026-04-21', { shouldDirty: false });
        expect(setValue).toHaveBeenNthCalledWith(3, 'mealName', '', { shouldDirty: false });
        expect(replaceItems).toHaveBeenCalledWith([
            {
                name: '',
                amount: '1人前',
                kcal: '0',
                protein: '0',
                fat: '0',
                carbs: '0',
            },
        ]);
    });
});

//何をテストするかについては、この関数の責務を考える。すると今関数はpromptを空にするrecordedDateを今日にする mea;Nameを空にする itemsをから一件にする。なのでテストは
//setValueが正しく呼ばれているか、replaceItemsが正しく呼ばれているか、など、関数が呼ばれているかどうか、この関数が依存先に対して正しい命令を出したかどうかを見ているテストであり、これを副作用テストという