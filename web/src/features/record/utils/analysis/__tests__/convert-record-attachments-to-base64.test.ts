/* 【責務】
 * convertRecordAttachmentsToBase64 の振る舞いを検証する。
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { convertRecordAttachmentsToBase64 } from '../convert-record-attachments-to-base64';

const { fileToBase64Mock } = vi.hoisted(() => ({
  fileToBase64Mock: vi.fn<(blob: Blob) => Promise<string>>(),
}));

vi.mock('@/utils/file-to-base64', () => ({
  fileToBase64: fileToBase64Mock,
}));

describe('convertRecordAttachmentsToBase64', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('previewUrl から blob を取得して base64 配列へ変換する', async () => {
    const firstBlob = new Blob(['a'], { type: 'image/png' });
    const secondBlob = new Blob(['b'], { type: 'image/jpeg' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ blob: vi.fn().mockResolvedValue(firstBlob) })
      .mockResolvedValueOnce({ blob: vi.fn().mockResolvedValue(secondBlob) });

    vi.stubGlobal('fetch', fetchMock);
    fileToBase64Mock
      .mockResolvedValueOnce('data:image/png;base64,aaa')
      .mockResolvedValueOnce('data:image/jpeg;base64,bbb');

    const result = await convertRecordAttachmentsToBase64([
      { id: '1', name: 'a.png', previewUrl: 'blob:a' },
      { id: '2', name: 'b.jpg', previewUrl: 'blob:b' },
    ]);

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'blob:a');
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'blob:b');
    expect(fileToBase64Mock).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      'data:image/png;base64,aaa',
      'data:image/jpeg;base64,bbb',
    ]);
  });
});
