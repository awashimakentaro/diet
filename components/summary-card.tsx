/**
 * components/summary-card.tsx
 *
 * 【責務】
 * DailySummary を視覚的に表示し、目標編集への導線を提供する。
 *
 * 【使用箇所】
 * - RecordScreen
 * - HistoryScreen
 * - SettingsScreen
 *
 * 【やらないこと】
 * - サマリー計算
 * - データ取得
 *
 * 【他ファイルとの関係】
 * - agents/summary-agent.ts が提供する DailySummary を受け取る。
 */

import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { DailySummary } from '@/agents/summary-agent';

export type SummaryCardProps = {
  summary: DailySummary;
  actionLabel?: string;
  onPressAction?: () => void;
};

/**
 * SummaryCard は 1 日分の栄養値と目標との差分を表示するコンポーネント。
 * 呼び出し元: 各スクリーン。
 * @param props summary 表示に必要な情報
 * @returns JSX.Element
 */
export function SummaryCard({ summary, actionLabel, onPressAction }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>本日のサマリー</Text>
        {actionLabel && onPressAction ? (
          <Pressable onPress={onPressAction} accessibilityRole="button">
            <Text style={styles.link}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.subtitle}>摂取 {Math.round(summary.totals.kcal)} kcal</Text>
      <CalorieGraph total={summary.totals.kcal} goal={summary.goal.kcal} />
      <MacroRow label="P" value={summary.totals.protein} goal={summary.goal.protein} diff={summary.diff.protein} />
      <MacroRow label="F" value={summary.totals.fat} goal={summary.goal.fat} diff={summary.diff.fat} />
      <MacroRow label="C" value={summary.totals.carbs} goal={summary.goal.carbs} diff={summary.diff.carbs} />
    </View>
  );
}

type MacroRowProps = {
  label: string;
  value: number;
  goal: number;
  diff: number;
};

/**
 * MacroRow は単一栄養素の数値と差分を表示する小コンポーネント。
 * 呼び出し元: SummaryCard。
 * @param props ラベルと数値
 * @returns JSX.Element
 */
function MacroRow({ label, value, goal, diff }: MacroRowProps) {
  const ratio = goal > 0 ? Math.min(1, Math.max(0, value / goal)) : 0;
  const diffText = diff === 0 ? '±0' : diff > 0 ? `+${Math.round(diff)}` : `${Math.round(diff)}`;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <AnimatedProgress ratio={ratio} />
      <Text style={styles.value}>{Math.round(value)} / {Math.round(goal) || 0}</Text>
      <Text style={[styles.diff, diff > 0 ? styles.diffPositive : diff < 0 ? styles.diffNegative : null]}>{diffText}</Text>
    </View>
  );
}

type AnimatedProgressProps = {
  ratio: number;
};

function AnimatedProgress({ ratio }: AnimatedProgressProps) {
  const animated = useRef(new Animated.Value(ratio)).current;
  useEffect(() => {
    Animated.timing(animated, {
      toValue: ratio,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [animated, ratio]);
  const width = animated.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.progressContainer}>
      <Animated.View style={[styles.progressBar, { width }]} />
    </View>
  );
}

type CalorieGraphProps = {
  total: number;
  goal: number;
};

function CalorieGraph({ total, goal }: CalorieGraphProps) {
  const baseRatio = goal > 0 ? Math.min(1, total / goal) : 0;
  const overflowRatio = goal > 0 ? Math.max(0, total / goal - 1) : 0;
  const baseAnim = useRef(new Animated.Value(baseRatio)).current;
  const overflowAnim = useRef(new Animated.Value(overflowRatio)).current;

  useEffect(() => {
    Animated.timing(baseAnim, {
      toValue: baseRatio,
      duration: 500,
      useNativeDriver: false,
    }).start();
    Animated.timing(overflowAnim, {
      toValue: overflowRatio,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [baseRatio, overflowRatio, baseAnim, overflowAnim]);

  const baseWidth = baseAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const overflowWidth = overflowAnim.interpolate({ inputRange: [0, 2], outputRange: ['0%', '200%'] });

  return (
    <View style={styles.calorieContainer}>
      <View style={styles.calorieHeader}>
        <Text style={styles.calorieLabel}>カロリー進捗</Text>
        <Text style={styles.calorieValue}>{Math.round(total)} / {goal || 0} kcal</Text>
      </View>
      <View style={styles.calorieBar}>
        <Animated.View style={[styles.calorieFill, { width: baseWidth }]} />
        {overflowRatio > 0 ? <Animated.View style={[styles.calorieOverflow, { width: overflowWidth }]} /> : null}
      </View>
      {goal > 0 ? (
        <Text style={styles.calorieInfo}>
          {total <= goal ? `目標まであと ${Math.round(goal - total)} kcal` : `目標を ${Math.round(total - goal)} kcal 超過`}
        </Text>
      ) : (
        <Text style={styles.calorieInfo}>目標を設定してください</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  link: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    width: 16,
    fontWeight: '600',
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0a7ea4',
  },
  value: {
    width: 90,
    fontVariant: ['tabular-nums'],
  },
  diff: {
    width: 60,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  diffPositive: {
    color: '#f06292',
  },
  diffNegative: {
    color: '#26a69a',
  },
  calorieContainer: {
    marginBottom: 12,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#555',
  },
  calorieValue: {
    fontWeight: '600',
  },
  calorieBar: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  calorieFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#0a7ea4',
  },
  calorieOverflow: {
    position: 'absolute',
    left: '100%',
    top: 0,
    bottom: 0,
    backgroundColor: '#f06292',
  },
  calorieInfo: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});
