/* 【責務】
 * buildRecordSaveSuccessState の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildRecordSaveSuccessState } from '../build-record-save-success-state';

describe('buildRecordSaveSuccessState', () => {//テストのまとまりを作るこの関数についてテストします
  it('保存成功後に必要な次状態を返す', () => {//テストケース この条件の時はこうなるはずです
    const result = buildRecordSaveSuccessState();

    expect(result).toEqual({//期待する結果　実際にそうなっているか確認する
      nextDraftOriginalText: '',
      nextWorkspaceMode: 'idle',
      feedback: {
        message: '履歴に保存しました。',
        tone: 'info',
      },
    });
  });
});
