import { describe, expect, it, vi } from 'vitest';
import { getTodayDateKey } from '../get-today-date-key';

vi.mock('@/lib/web-date', () => ({
    getTodayKey: () => '2026-04-20',
}));

describe('getTodayDateKey', () => {
    it('今日の日付キーを返す', () => {
        const expected = '2026-04-20';
        const result = getTodayDateKey();
        expect(result).toEqual(expected);
    })
})

  