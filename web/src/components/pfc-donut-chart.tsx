/**
 * web/src/features/record/components/pfc-donut-chart.tsx
 *
 * 【責務】
 * たんばく質(P)、脂質(F)、炭水化物(C)のエネルギー比率をドーナツグラフで描画する。
 */

import { motion } from 'framer-motion';
import type { JSX } from 'react';

type PfcDonutChartProps = {
    protein: number;
    fat: number;
    carbs: number;
    size?: number;
};

export function PfcDonutChart({
    protein,
    fat,
    carbs,
    size = 120,
}: PfcDonutChartProps): JSX.Element {
    // エネルギー換算 (P:4, F:9, C:4)
    const pKcal = protein * 4;
    const fKcal = fat * 9;
    const cKcal = carbs * 4;
    const totalKcal = pKcal + fKcal + cKcal;

    if (totalKcal === 0) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    background: 'var(--slate-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: 'var(--slate-400)'
                }}
            >
                No Data
            </div>
        );
    }

    const pRatio = pKcal / totalKcal;
    const fRatio = fKcal / totalKcal;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="pfc-donut" style={{ width: size, height: size, position: 'relative' }}>
            <svg
                className="pfc-donut__svg"
                viewBox="0 0 100 100"
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Carbohydrates (Base circle or bottom layer) */}
                <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r={radius}
                    stroke="var(--emerald-500)"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeWidth="12"
                />

                {/* Fat */}
                <motion.circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${(pRatio + fRatio) * circumference} ${circumference}` }}
                    r={radius}
                    stroke="var(--amber-500)"
                    strokeWidth="12"
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Protein */}
                <motion.circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: `${pRatio * circumference} ${circumference}` }}
                    r={radius}
                    stroke="var(--blue-500)"
                    strokeWidth="12"
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {/* Center Hole for Donut effect */}
                <circle cx="50" cy="50" fill="white" r="28" />
            </svg>

            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                }}
            >
                <p style={{ fontSize: '10px', color: 'var(--slate-400)', margin: 0 }}>P</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--slate-800)', margin: 0 }}>
                    {Math.round(pRatio * 100)}%
                </p>
            </div>
        </div>
    );
}
