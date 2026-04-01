/**
 * web/src/features/home/components/weight-trend-chart.tsx
 *
 * 【責務】
 * 体重推移ログを Home 用の線グラフとして描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/(home)/_components/home-page-screen.tsx から呼ばれる。
 * - user_weight_logs の配列を受け取り SVG の折れ線へ変換する。
 *
 * 【やらないこと】
 * - DB 取得
 * - ログ保存
 * - ページ全体の構成管理
 *
 * 【他ファイルとの関係】
 * - list-user-weight-logs.ts の型を利用する。
 */

'use client';

import { useMemo, type JSX } from 'react';

import type { UserWeightLogPoint } from '../list-user-weight-logs';

type WeightTrendChartProps = {
  points: UserWeightLogPoint[];
  variant?: 'full' | 'callout';
  selectedPointId?: string | null;
  onSelectPoint?: (pointId: string) => void;
};

type ChartPoint = {
  x: number;
  y: number;
};

const CHART_WIDTH = 420;
const CHART_HEIGHT = 108;
const CHART_PADDING_X = 18;
const CHART_PADDING_Y = 10;

function buildChartPoints(points: UserWeightLogPoint[]): ChartPoint[] {
  if (points.length === 0) {
    return [];
  }

  const values = points.map((point) => point.currentWeightKg);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);
  const usableWidth = CHART_WIDTH - CHART_PADDING_X * 2;
  const usableHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;

  return points.map((point, index) => ({
    x: CHART_PADDING_X + (usableWidth * index) / Math.max(1, points.length - 1),
    y: CHART_PADDING_Y + usableHeight - (((point.currentWeightKg - minValue) / range) * usableHeight),
  }));
}

function buildPath(points: ChartPoint[]): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function buildLabelFormatter(): Intl.DateTimeFormatOptions {
  return { month: 'numeric', day: 'numeric' };
}

export function WeightTrendChart({
  points,
  variant = 'full',
  selectedPointId,
  onSelectPoint,
}: WeightTrendChartProps): JSX.Element {
  const chartPoints = buildChartPoints(points);
  const path = buildPath(chartPoints);
  const lastPoint = chartPoints.at(-1);
  const resolvedSelectedPointId = selectedPointId ?? points.at(-1)?.id ?? null;
  const labelFormat = buildLabelFormatter();
  const selectedPoint = useMemo(
    () => points.find((point) => point.id === resolvedSelectedPointId) ?? points.at(-1) ?? null,
    [points, resolvedSelectedPointId],
  );
  const selectedIndex = selectedPoint === null ? -1 : points.findIndex((point) => point.id === selectedPoint.id);

  if (points.length === 0) {
    return (
      <div className="home-screen__weight-empty">
        <p>まだ体重ログがありません。プロフィールを保存すると推移がここに表示されます。</p>
      </div>
    );
  }

  return (
    <div className="home-screen__weight-chart-wrap">
      {variant === 'callout' && selectedPoint !== null ? (
        <div className="home-screen__weight-callout home-screen__weight-callout--inline">
          <span>
            {new Intl.DateTimeFormat('ja-JP', {
              month: 'long',
              day: 'numeric',
            }).format(new Date(selectedPoint.recordedAt))}
          </span>
          <strong>{selectedPoint.currentWeightKg} kg</strong>
          <em>
            目標 {selectedPoint.targetWeightKg ?? '--'} kg
          </em>
        </div>
      ) : null}

      {variant === 'callout' ? null : (
        <>
          <svg
            aria-label="体重推移グラフ"
            className="home-screen__weight-chart"
            height={CHART_HEIGHT}
            role="img"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            width={CHART_WIDTH}
          >
            <defs>
              <linearGradient id="weightTrendStroke" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>

            {[0, 1, 2].map((index) => {
              const y = CHART_PADDING_Y + ((CHART_HEIGHT - CHART_PADDING_Y * 2) / 2) * index;

              return (
                <line
                  className="home-screen__weight-grid-line"
                  key={index}
                  x1={CHART_PADDING_X}
                  x2={CHART_WIDTH - CHART_PADDING_X}
                  y1={y}
                  y2={y}
                />
              );
            })}

            <path className="home-screen__weight-path-shadow" d={path} />
            <path className="home-screen__weight-path" d={path} />

            {chartPoints.map((point, index) => (
              <g key={points[index].id}>
                <circle
                  className="home-screen__weight-hit-area"
                  cx={point.x}
                  cy={point.y}
                  onClick={() => onSelectPoint?.(points[index].id)}
                  r={16}
                />
                <circle
                  className={
                    selectedIndex === index
                      ? 'home-screen__weight-point home-screen__weight-point--selected'
                      : 'home-screen__weight-point'
                  }
                  cx={point.x}
                  cy={point.y}
                  r={4}
                />
              </g>
            ))}

            {lastPoint ? (
              <circle
                className="home-screen__weight-point home-screen__weight-point--latest"
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={6}
              />
            ) : null}
          </svg>

          <div className="home-screen__weight-label-row">
            {points.map((point, index) => (
              <span
                className={selectedIndex === index ? 'home-screen__weight-label home-screen__weight-label--active' : 'home-screen__weight-label'}
                key={point.id}
              >
                {new Intl.DateTimeFormat('ja-JP', labelFormat).format(new Date(point.recordedAt))}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
