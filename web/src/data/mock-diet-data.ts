/**
 * web/src/data/mock-diet-data.ts
 *
 * 【責務】
 * Web 版 UI の初期表示に使うサンプルデータを提供する。
 *
 * 【使用箇所】
 * - web/app/page.tsx
 * - web/app/record/page.tsx
 * - web/app/history/page.tsx
 * - web/app/foods/page.tsx
 * - web/app/settings/page.tsx
 *
 * 【やらないこと】
 * - 実 API 通信
 * - 永続化
 * - データ計算ロジック
 *
 * 【他ファイルとの関係】
 * - web/src/domain/web-diet-schema.ts で定義した型を満たす固定データを返す。
 */

import type {
  WebGoal,
  WebLibraryEntry,
  WebMeal,
  WebNotificationSetting,
  WebProfileSnapshot,
  WebRecordDraft,
} from '@/domain/web-diet-schema';

export const mockGoal: WebGoal = {
  source: 'manual',
  updatedAt: '2026-03-20T07:10:00+09:00',
  totals: {
    kcal: 2100,
    protein: 145,
    fat: 60,
    carbs: 255,
  },
};

export const mockTodayTotals = {
  kcal: 1480,
  protein: 102,
  fat: 42,
  carbs: 171,
};

export const mockRecordDraft: WebRecordDraft = {
  menuName: '鶏むね肉と玄米のワンプレート',
  originalText: '鶏むね肉、玄米、ブロッコリー、ゆで卵を食べた',
  source: 'text',
  warnings: [
    'AI が推定した栄養値です。保存前に分量を微調整してください。',
  ],
  totals: {
    kcal: 612,
    protein: 48,
    fat: 16,
    carbs: 67,
  },
  items: [
    {
      id: 'draft-item-1',
      name: '鶏むね肉',
      amount: '180g',
      kcal: 297,
      protein: 39,
      fat: 7,
      carbs: 0,
    },
    {
      id: 'draft-item-2',
      name: '玄米',
      amount: '180g',
      kcal: 280,
      protein: 5,
      fat: 2,
      carbs: 59,
    },
    {
      id: 'draft-item-3',
      name: 'ブロッコリー',
      amount: '80g',
      kcal: 28,
      protein: 3,
      fat: 0,
      carbs: 5,
    },
    {
      id: 'draft-item-4',
      name: 'ゆで卵',
      amount: '1個',
      kcal: 77,
      protein: 6,
      fat: 7,
      carbs: 3,
    },
  ],
};

export const mockMeals: WebMeal[] = [
  {
    id: 'meal-1',
    recordedAt: '2026-03-20T08:15:00+09:00',
    menuName: 'オートミール朝食',
    originalText: 'オートミール、バナナ、プロテイン',
    source: 'text',
    totals: {
      kcal: 398,
      protein: 31,
      fat: 8,
      carbs: 50,
    },
    items: [
      {
        id: 'meal-1-item-1',
        name: 'オートミール',
        amount: '60g',
        kcal: 228,
        protein: 8,
        fat: 4,
        carbs: 38,
      },
      {
        id: 'meal-1-item-2',
        name: 'バナナ',
        amount: '1本',
        kcal: 93,
        protein: 1,
        fat: 0,
        carbs: 21,
      },
      {
        id: 'meal-1-item-3',
        name: 'ホエイプロテイン',
        amount: '1杯',
        kcal: 77,
        protein: 22,
        fat: 4,
        carbs: 1,
      },
    ],
  },
  {
    id: 'meal-2',
    recordedAt: '2026-03-20T12:40:00+09:00',
    menuName: '鮭と雑穀米ランチ',
    originalText: '焼き鮭、雑穀米、味噌汁、サラダ',
    source: 'image',
    totals: {
      kcal: 470,
      protein: 34,
      fat: 13,
      carbs: 51,
    },
    items: [
      {
        id: 'meal-2-item-1',
        name: '焼き鮭',
        amount: '1切れ',
        kcal: 212,
        protein: 26,
        fat: 11,
        carbs: 0,
      },
      {
        id: 'meal-2-item-2',
        name: '雑穀米',
        amount: '150g',
        kcal: 234,
        protein: 4,
        fat: 1,
        carbs: 49,
      },
      {
        id: 'meal-2-item-3',
        name: '味噌汁',
        amount: '1杯',
        kcal: 24,
        protein: 2,
        fat: 1,
        carbs: 2,
      },
    ],
  },
  {
    id: 'meal-3',
    recordedAt: '2026-03-20T18:55:00+09:00',
    menuName: '鶏むね肉と玄米のワンプレート',
    originalText: '鶏むね肉、玄米、ブロッコリー、ゆで卵を食べた',
    source: 'manual',
    totals: {
      kcal: 612,
      protein: 48,
      fat: 16,
      carbs: 67,
    },
    items: mockRecordDraft.items,
  },
];

export const mockLibraryEntries: WebLibraryEntry[] = [
  {
    id: 'library-1',
    name: '高たんぱく朝食',
    description: '忙しい朝にそのまま使える、たんぱく質優先の定番セット。',
    amount: '1セット',
    tags: ['朝食', '時短', '高たんぱく'],
    totals: {
      kcal: 420,
      protein: 34,
      fat: 11,
      carbs: 45,
    },
    items: [
      {
        id: 'library-1-item-1',
        name: 'ギリシャヨーグルト',
        amount: '1カップ',
        kcal: 120,
        protein: 12,
        fat: 0,
        carbs: 7,
      },
      {
        id: 'library-1-item-2',
        name: 'オートミール',
        amount: '50g',
        kcal: 190,
        protein: 7,
        fat: 3,
        carbs: 31,
      },
      {
        id: 'library-1-item-3',
        name: 'ゆで卵',
        amount: '2個',
        kcal: 110,
        protein: 15,
        fat: 8,
        carbs: 7,
      },
    ],
  },
  {
    id: 'library-2',
    name: '減量中ランチボウル',
    description: '鶏むね肉と穀物を軸にした、昼用の再利用メニュー。',
    amount: '1ボウル',
    tags: ['昼食', '減量', '定番'],
    totals: {
      kcal: 520,
      protein: 43,
      fat: 14,
      carbs: 56,
    },
    items: mockRecordDraft.items,
  },
  {
    id: 'library-3',
    name: '間食プロテインセット',
    description: '夜の食べ過ぎ防止用に用意しておく軽食。',
    amount: '1セット',
    tags: ['間食', 'リカバリー'],
    totals: {
      kcal: 210,
      protein: 23,
      fat: 5,
      carbs: 18,
    },
    items: [
      {
        id: 'library-3-item-1',
        name: 'ホエイプロテイン',
        amount: '1杯',
        kcal: 118,
        protein: 22,
        fat: 2,
        carbs: 3,
      },
      {
        id: 'library-3-item-2',
        name: 'キウイ',
        amount: '1個',
        kcal: 51,
        protein: 1,
        fat: 0,
        carbs: 13,
      },
      {
        id: 'library-3-item-3',
        name: 'アーモンド',
        amount: '10粒',
        kcal: 41,
        protein: 0,
        fat: 3,
        carbs: 2,
      },
    ],
  },
];

export const mockProfileSnapshot: WebProfileSnapshot = {
  gender: 'male',
  age: 30,
  heightCm: 173,
  currentWeightKg: 70,
  targetWeightKg: 66,
  targetWeeks: 10,
  activityLevel: 'moderate',
};

export const mockNotificationSetting: WebNotificationSetting = {
  enabled: true,
  time: '00:00',
  timezone: 'Asia/Tokyo',
};
