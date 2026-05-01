/* 【責務】
 * Foods 画面の feedback 文言生成を検証する。
 */

import { describe, expect, it } from 'vitest';

import {
  buildFoodDeleteErrorFeedback,
  buildFoodDeleteSuccessFeedback,
  buildFoodReuseErrorFeedback,
  buildFoodReuseSuccessFeedback,
  buildFoodUpdateErrorFeedback,
  buildFoodUpdateSuccessFeedback,
} from '../build-foods-feedback';

describe('build-foods-feedback', () => {
  it('成功文言を生成する', () => {
    expect(buildFoodUpdateSuccessFeedback()).toBe('食品カードを更新しました。');
    expect(buildFoodDeleteSuccessFeedback()).toBe('食品カードを削除しました。');
    expect(buildFoodReuseSuccessFeedback({ name: '朝食セット' })).toBe('「朝食セット」を履歴へ追加しました。');
  });

  it('Error の message を失敗文言として使う', () => {
    expect(buildFoodUpdateErrorFeedback(new Error('更新失敗'))).toBe('更新失敗');
    expect(buildFoodDeleteErrorFeedback(new Error('削除失敗'))).toBe('削除失敗');
    expect(buildFoodReuseErrorFeedback(new Error('追加失敗'))).toBe('追加失敗');
  });

  it('Error 以外なら既定の失敗文言を返す', () => {
    expect(buildFoodUpdateErrorFeedback('error')).toBe('食品カードを更新できませんでした。');
    expect(buildFoodDeleteErrorFeedback('error')).toBe('食品カードを削除できませんでした。');
    expect(buildFoodReuseErrorFeedback('error')).toBe('履歴へ追加できませんでした。');
  });
});
