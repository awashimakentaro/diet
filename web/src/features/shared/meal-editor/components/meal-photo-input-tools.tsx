/* 【責務】
 * 食事編集の写真添付入力導線を描画する。
 */

'use client';

import { Camera, ImagePlus } from 'lucide-react';
import { useId, type ChangeEvent, type JSX } from 'react';

type MealPhotoInputToolsProps = {
  onAttachmentChange: (event: ChangeEvent<HTMLInputElement>) => boolean;
  onPhotoRecord: () => void;
  disabled?: boolean;
};

export function MealPhotoInputTools({
  onAttachmentChange,
  onPhotoRecord,
  disabled = false,
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
        disabled={disabled}
        onChange={handlePhotoChange}
        type="file"
      />

      <input
        accept="image/*"
        capture="environment"
        className="record-screen__photo-input"
        disabled={disabled}
        id={cameraInputId}
        onChange={handlePhotoChange}
        type="file"
      />

      <label
        aria-disabled={disabled}
        className={disabled ? 'record-screen__prompt-tool record-screen__prompt-tool--disabled' : 'record-screen__prompt-tool'}
        htmlFor={disabled ? undefined : fileInputId}
      >
        <ImagePlus size={16} strokeWidth={2.1} />
        <span>写真を追加</span>
      </label>

      <label
        aria-disabled={disabled}
        className={disabled ? 'record-screen__prompt-tool record-screen__prompt-tool--disabled' : 'record-screen__prompt-tool'}
        htmlFor={disabled ? undefined : cameraInputId}
      >
        <Camera size={16} strokeWidth={2.1} />
        <span>カメラ</span>
      </label>
    </>
  );
}
