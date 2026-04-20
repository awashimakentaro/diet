/* 【責務】
 * 食事編集の写真添付入力導線を描画する。
 */

'use client';

import { Camera, ImagePlus } from 'lucide-react';
import { useId, type ChangeEvent, type JSX } from 'react';

type MealPhotoInputToolsProps = {
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onPhotoRecord: () => void;
};

export function MealPhotoInputTools({
  onAttachmentChange,
  onPhotoRecord,
}: MealPhotoInputToolsProps): JSX.Element {
  const fileInputId = useId();
  const cameraInputId = useId();

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>): void {
    const hasAttached = onAttachmentChange(event);

    if (hasAttached) {
      onPhotoRecord();
    }
  }

  return (
    <>
      <input
        accept="image/*"
        className="record-screen__photo-input"
        id={fileInputId}
        multiple
        onChange={handlePhotoChange}
        type="file"
      />

      <input
        accept="image/*"
        capture="environment"
        className="record-screen__photo-input"
        id={cameraInputId}
        onChange={handlePhotoChange}
        type="file"
      />

      <label className="record-screen__prompt-tool" htmlFor={fileInputId}>
        <ImagePlus size={16} strokeWidth={2.1} />
        <span>写真を追加</span>
      </label>

      <label className="record-screen__prompt-tool" htmlFor={cameraInputId}>
        <Camera size={16} strokeWidth={2.1} />
        <span>カメラ</span>
      </label>
    </>
  );
}
