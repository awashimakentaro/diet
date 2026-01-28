/**
 * lib/diet-store.ts
 *
 * 【責務】
 * Diet アプリのインメモリ状態と購読仕組みを管理し、各エージェントからの読み書きを一本化する。
 *
 * 【使用箇所】
 * - agents ディレクトリの CRUD 処理
 * - hooks/use-diet-state.ts での購読
 *
 * 【やらないこと】
 * - 永続ストレージへの保存
 * - ネットワーク同期
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の型を利用して状態整合性を守る。
 */

import { AnalyzeDraft, FoodLibraryEntry, Goal, Meal, NotificationSetting, Profile } from '@/constants/schema';

export type DietState = {
  meals: Meal[];
  foodLibrary: FoodLibraryEntry[];
  goal: Goal;
  profile: Profile | null;
  notification: NotificationSetting;
  draftInbox: AnalyzeDraft[];
};

/**
 * 状態変更を通知するためのコールバック集合。
 */
const listeners = new Set<() => void>();

/**
 * Goal の初期値を生成する。
 * 呼び出し元: createInitialState, resetDietState。
 * @returns 空の Goal
 */
function createEmptyGoal(): Goal {
  return {
    id: 'goal-pending',
    kcal: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    source: 'manual',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * DietState の初期構造を生成する。
 * 呼び出し元: 初期化、resetDietState。
 * @returns 初期状態
 */
function createInitialState(): DietState {
  return {
    meals: [],
    foodLibrary: [],
    goal: createEmptyGoal(),
    profile: null,
    notification: {
      enabled: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      times: ['midnight'],
    },
    draftInbox: [],
  };
}

let state: DietState = createInitialState();

/**
 * 状態を購読し、変更時に通知を受け取る。
 * 呼び出し元: hooks/use-diet-state。
 * @param listener 変更通知時に呼ばれる関数
 * @returns 購読解除のための関数
 * @remarks listener 以外への副作用はない。
 */
export function subscribeDietState(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * 現在の状態を取得する。
 * 呼び出し元: 各エージェント。
 * @returns 最新の DietState
 * @remarks 読み取りのみで副作用はない。
 */
export function getDietState(): DietState {
  return state;
}

/**
 * 状態を更新し、全購読者へ通知する。
 * 呼び出し元: 各エージェントの保存・削除処理。
 * @param updater 現在の状態から次の状態を返すコールバック
 * @remarks updater 内で不変データに差し替えること。
 */
export function setDietState(updater: (current: DietState) => DietState): void {
  state = updater(state);
  listeners.forEach((listener) => listener());
}

/**
 * 他画面から RecordScreen へ渡す Draft をキューへ積む。
 * 呼び出し元: HistoryScreen の複製、FoodLibrary からの貼り付け。
 * @param draft 追加する Draft
 * @remarks 状態を更新して購読者へ通知する。
 */
export function enqueueDraft(draft: AnalyzeDraft): void {
  setDietState((current) => ({ ...current, draftInbox: [...current.draftInbox, draft] }));
}

/**
 * Draft キューを消費し、RecordScreen へ返す。
 * 呼び出し元: RecordScreen 初期化時。
 * @returns 取り出した Draft 配列
 * @remarks 副作用として draftInbox を空にする。
 */
export function consumeDraftInbox(): AnalyzeDraft[] {
  const drafts = state.draftInbox;
  if (drafts.length === 0) {
    return [];
  }
  setDietState((current) => ({ ...current, draftInbox: [] }));
  return drafts;
}

/**
 * Meal 一覧を置き換えるユーティリティ。
 * @param meals 新しい Meal 配列
 */
export function setMeals(meals: Meal[]): void {
  setDietState((current) => ({ ...current, meals }));
}

/**
 * 食品ライブラリを置き換えるユーティリティ。
 * @param entries FoodLibraryEntry 配列
 */
export function setFoodLibrary(entries: FoodLibraryEntry[]): void {
  setDietState((current) => ({ ...current, foodLibrary: entries }));
}

/**
 * Goal を更新する。
 * @param goal 保存済み Goal
 */
export function setGoal(goal: Goal): void {
  setDietState((current) => ({ ...current, goal }));
}

/**
 * 通知設定を更新する。
 * @param setting NotificationSetting
 */
export function setNotification(setting: NotificationSetting): void {
  setDietState((current) => ({ ...current, notification: setting }));
}

/**
 * DietState を初期値へ戻し、全購読者へ通知する。
 * 呼び出し元: AuthProvider でのサインアウト処理。
 */
export function resetDietState(): void {
  state = createInitialState();
  listeners.forEach((listener) => listener());
}
