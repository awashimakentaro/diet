/**
 * web/src/utils/file-to-base64.ts
 */

/**
 * File または Blob を Base64 文字列（Data URL）に変換する。
 * @param file 変換対象のファイル
 * @returns Base64 文字列
 */
export async function fileToBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert file to base64.'));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Data URL から MIME タイプとデータ部分（純粋な base64）を分離する。
 * @param dataUrl data:image/png;base64,... 形式の文字列
 * @returns { mimeType: string, base64: string }
 */
export function parseDataUrl(dataUrl: string): { mimeType: string; base64: string } {
    const [header, base64] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
    return { mimeType, base64 };
}
