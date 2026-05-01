/* 【責務】
 * buildNotificationSchedulePayload の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import { buildNotificationSchedulePayload } from '../build-notification-schedule-payload';

describe('buildNotificationSchedulePayload', () => {
  it('通知 schedule payload を構築する', () => {
    expect(
      buildNotificationSchedulePayload({
        enabled: true,
        selectedReminder: 'night',
      }),
    ).toEqual({
      ok: true,
      payload: {
        enabled: true,
        reminder: 'night',
        time: '22:00',
      },
    });
  });

  it('通知時間が未選択なら error を返す', () => {
    expect(
      buildNotificationSchedulePayload({
        enabled: true,
        selectedReminder: null,
      }),
    ).toEqual({
      ok: false,
      error: '通知時間を選択してください。',
    });
  });
});
