/**
 * features/record/components/record-summary-card.tsx
 *
 * 【責務】
 * 記録タブ向けに、当日の栄養サマリーをカード形式で視覚化する。
 *
 * 【使用箇所】
 * - RecordScreen
 * - HistoryScreen
 *
 * 【やらないこと】
 * - サマリー計算
 * - 目標値の保存
 *
 * 【他ファイルとの関係】
 * - agents/summary-agent.ts の DailySummary を受け取り描画する。
 */

import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DailySummary } from '@/agents/summary-agent';

export type RecordSummaryCardProps = {
  summary: DailySummary;
};

type MacroRowConfig = {
  label: string;
  color: string;
  value: number;
  goal: number;
  diff: number;
};

/**
 * 記録タブの栄養サマリーカードを描画する。
 * 呼び出し元: RecordScreen。
 * @param props DailySummary を含む表示データ
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
export function RecordSummaryCard({ summary }: RecordSummaryCardProps): JSX.Element {
  const kcalTotal = Math.round(summary.totals.kcal);
  const kcalGoal = Math.round(summary.goal.kcal);
  const remainingText = buildRemainingText(summary.totals.kcal, summary.goal.kcal);
  const remainingTone = summary.goal.kcal > 0 && summary.totals.kcal > summary.goal.kcal ? 'over' : 'left';
  const macroRows: MacroRowConfig[] = [
    {
      label: 'Protein (P)',
      color: '#2b7fff',
      value: summary.totals.protein,
      goal: summary.goal.protein,
      diff: summary.diff.protein,
    },
    {
      label: 'Fat (F)',
      color: '#f0b100',
      value: summary.totals.fat,
      goal: summary.goal.fat,
      diff: summary.diff.fat,
    },
    {
      label: 'Carbs (C)',
      color: '#00c950',
      value: summary.totals.carbs,
      goal: summary.goal.carbs,
      diff: summary.diff.carbs,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerLabel}>Nutrition Status</Text>
          <View style={styles.kcalRow}>
            <Text style={styles.kcalValue}>{kcalTotal}</Text>
            <Text style={styles.kcalGoal}>/ {kcalGoal || 0} kcal</Text>
          </View>
        </View>
        <View style={[styles.remainingBadge, remainingTone === 'over' ? styles.remainingBadgeOver : styles.remainingBadgeLeft]}>
          <Text style={[styles.remainingText, remainingTone === 'over' ? styles.remainingTextOver : styles.remainingTextLeft]}>
            {remainingText}
          </Text>
        </View>
      </View>
      <View style={styles.macroList}>
        {macroRows.map((row) => (
          <RecordMacroRow key={row.label} {...row} />
        ))}
      </View>
    </View>
  );
}

/**
 * 各栄養素の進捗バーを描画する。
 * 呼び出し元: RecordSummaryCard。
 * @param props 栄養素の表示情報
 * @returns JSX.Element
 * @remarks 副作用は存在しない。
 */
function RecordMacroRow({ label, color, value, goal, diff }: MacroRowConfig): JSX.Element {
  const ratio = clampRatio(value, goal);
  const diffText = formatDiff(diff);
  const diffStyle = diff > 0 ? styles.diffOver : styles.diffLeft;

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <View style={styles.macroValues}>
          <Text style={styles.macroValue}>{Math.round(value)}</Text>
          <Text style={styles.macroGoal}>/ {Math.round(goal) || 0}</Text>
          <Text style={[styles.macroDiff, diffStyle]}>{diffText}</Text>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

/**
 * 目標に対する残量テキストを生成する。
 * 呼び出し元: RecordSummaryCard。
 * @param total 実績カロリー
 * @param goal 目標カロリー
 * @returns 表示用テキスト
 * @remarks 副作用は存在しない。
 */
function buildRemainingText(total: number, goal: number): string {
  if (goal <= 0) {
    return 'Left: --';
  }
  const remaining = Math.round(goal - total);
  if (remaining >= 0) {
    return `Left: ${remaining}`;
  }
  return `Over: ${Math.abs(remaining)}`;
}

/**
 * 進捗率を 0〜1 に正規化する。
 * 呼び出し元: RecordMacroRow。
 * @param value 実績値
 * @param goal 目標値
 * @returns 0〜1 の進捗率
 * @remarks 副作用は存在しない。
 */
function clampRatio(value: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, value / goal));
}

/**
 * 差分数値を表示用に整形する。
 * 呼び出し元: RecordMacroRow。
 * @param diff 差分値
 * @returns 表示用の文字列
 * @remarks 副作用は存在しない。
 */
function formatDiff(diff: number): string {
  const rounded = Math.round(diff);
  if (rounded === 0) {
    return '0';
  }
  if (rounded > 0) {
    return `+${rounded}`;
  }
  return `${rounded}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextBlock: {
    gap: 8,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#99a1af',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  kcalValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: 0.3,
    fontVariant: ['tabular-nums'],
  },
  kcalGoal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#99a1af',
  },
  remainingBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  remainingBadgeLeft: {
    backgroundColor: '#eff6ff',
  },
  remainingBadgeOver: {
    backgroundColor: '#fee2e2',
  },
  remainingText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  remainingTextLeft: {
    color: '#155dfc',
  },
  remainingTextOver: {
    color: '#dc2626',
  },
  macroList: {
    gap: 16,
  },
  macroRow: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6a7282',
  },
  macroValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#101828',
    fontVariant: ['tabular-nums'],
  },
  macroGoal: {
    fontSize: 11,
    fontWeight: '500',
    color: '#99a1af',
  },
  macroDiff: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    minWidth: 32,
  },
  diffLeft: {
    color: '#d1d5dc',
  },
  diffOver: {
    color: '#dc2626',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
});
