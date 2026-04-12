/* 【責務】
 * Record の保存元種別をワークスペース状態から判定する。
 */

type WorkspaceMode = 'idle' | 'manual' | 'generated';

export function resolveRecordSaveSource(
  workspaceMode: WorkspaceMode,
): 'text' | 'manual' {
  return workspaceMode === 'generated' ? 'text' : 'manual';
}
