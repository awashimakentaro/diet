/**
 * web/src/components/app-skeleton.tsx
 *
 * 【責務】
 * データ取得中に表示するスケルトン UI コンポーネントを提供する。
 * 各画面で再利用可能な SkeletonLine, SkeletonCard, SkeletonCircle を export する。
 */

import type { CSSProperties, JSX } from 'react';

const SKELETON_BAR_HEIGHTS = ['42px', '78px', '64px', '92px', '58px', '84px', '70px'] as const;

type SkeletonLineProps = {
    width?: string;
    height?: string;
    borderRadius?: string;
    style?: CSSProperties;
};

export function SkeletonLine({
    width = '100%',
    height = '14px',
    borderRadius = '8px',
    style,
}: SkeletonLineProps): JSX.Element {
    return (
        <div
            className="skeleton-shimmer"
            style={{ width, height, borderRadius, ...style }}
        />
    );
}

type SkeletonCardProps = {
    children?: React.ReactNode;
    className?: string;
    style?: CSSProperties;
};

export function SkeletonCard({ children, className = '', style }: SkeletonCardProps): JSX.Element {
    return (
        <div className={`skeleton-card ${className}`.trim()} style={style}>
            {children}
        </div>
    );
}

/** Home 画面用のスケルトン */
export function HomeScreenSkeleton(): JSX.Element {
    return (
        <div className="skeleton-screen">
            {/* Hero grid: Summary + Streak */}
            <div className="skeleton-hero-grid">
                <SkeletonCard className="skeleton-card--large">
                    <SkeletonLine width="40%" height="12px" />
                    <SkeletonLine width="60%" height="28px" style={{ marginTop: 12 }} />
                    <div className="skeleton-row" style={{ marginTop: 16 }}>
                        <SkeletonLine width="30%" height="18px" />
                        <SkeletonLine width="30%" height="18px" />
                        <SkeletonLine width="30%" height="18px" />
                    </div>
                    <SkeletonLine width="100%" height="8px" style={{ marginTop: 16, borderRadius: '99px' }} />
                </SkeletonCard>

                <SkeletonCard>
                    <SkeletonLine width="50%" height="10px" />
                    <SkeletonLine width="30%" height="32px" style={{ marginTop: 12 }} />
                    <SkeletonLine width="80%" height="12px" style={{ marginTop: 12 }} />
                </SkeletonCard>
            </div>

            {/* Bottom grid: Insights + Activity */}
            <div className="skeleton-bottom-grid">
                <SkeletonCard>
                    <SkeletonLine width="35%" height="10px" />
                    <SkeletonLine width="55%" height="16px" style={{ marginTop: 8 }} />
                    <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                        <SkeletonLine width="100%" height="60px" borderRadius="16px" />
                        <SkeletonLine width="100%" height="60px" borderRadius="16px" />
                    </div>
                </SkeletonCard>

                <SkeletonCard>
                    <SkeletonLine width="35%" height="10px" />
                    <SkeletonLine width="45%" height="16px" style={{ marginTop: 8 }} />
                    <div className="skeleton-row" style={{ marginTop: 16 }}>
                        <SkeletonLine width="40%" height="48px" borderRadius="18px" />
                        <SkeletonLine width="40%" height="48px" borderRadius="18px" />
                    </div>
                    <SkeletonLine width="100%" height="220px" borderRadius="24px" style={{ marginTop: 16 }} />
                </SkeletonCard>

                <SkeletonCard>
                    <SkeletonLine width="45%" height="10px" />
                    <SkeletonLine width="60%" height="16px" style={{ marginTop: 8 }} />
                    <div className="skeleton-bar-chart" style={{ marginTop: 16 }}>
                        {SKELETON_BAR_HEIGHTS.map((height, i) => (
                            <div key={i} className="skeleton-bar-col">
                                <SkeletonLine
                                    width="100%"
                                    height={height}
                                    borderRadius="6px"
                                />
                                <SkeletonLine width="100%" height="10px" style={{ marginTop: 4 }} />
                            </div>
                        ))}
                    </div>
                </SkeletonCard>
            </div>
        </div>
    );
}

/** History 画面用のスケルトン */
export function HistoryScreenSkeleton(): JSX.Element {
    return (
        <div className="skeleton-screen">
            <div className="skeleton-history-layout">
                {/* Summary pane */}
                <SkeletonCard className="skeleton-card--large">
                    <SkeletonLine width="40%" height="12px" />
                    <SkeletonLine width="55%" height="28px" style={{ marginTop: 12 }} />
                    <div className="skeleton-row" style={{ marginTop: 16 }}>
                        <SkeletonLine width="30%" height="18px" />
                        <SkeletonLine width="30%" height="18px" />
                        <SkeletonLine width="30%" height="18px" />
                    </div>
                </SkeletonCard>

                {/* Content pane */}
                <div style={{ display: 'grid', gap: 16 }}>
                    {/* Date chip */}
                    <SkeletonLine width="240px" height="44px" borderRadius="22px" />

                    {/* Meal cards */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonCard key={i}>
                            <div className="skeleton-row">
                                <SkeletonLine width="40%" height="16px" />
                                <SkeletonLine width="20%" height="12px" />
                            </div>
                            <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                                <SkeletonLine width="100%" height="12px" />
                                <SkeletonLine width="75%" height="12px" />
                            </div>
                            <div className="skeleton-row" style={{ marginTop: 14 }}>
                                <SkeletonLine width="60px" height="30px" borderRadius="10px" />
                                <SkeletonLine width="60px" height="30px" borderRadius="10px" />
                                <SkeletonLine width="80px" height="30px" borderRadius="10px" />
                            </div>
                        </SkeletonCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Foods 画面用のスケルトン */
export function FoodsScreenSkeleton(): JSX.Element {
    return (
        <div className="skeleton-screen">
            {/* Search bar */}
            <SkeletonLine width="100%" height="52px" borderRadius="26px" />

            {/* Food cards */}
            <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div className="food-card skeleton-food-card" key={i}>
                        <div className="food-card__row">
                            <div className="food-card__main">
                                <SkeletonLine width="132px" height="16px" />
                                <div className="food-card__metrics">
                                    <SkeletonLine width="62px" height="24px" borderRadius="8px" />
                                    <SkeletonLine width="68px" height="24px" borderRadius="8px" />
                                    <SkeletonLine width="64px" height="24px" borderRadius="8px" />
                                    <SkeletonLine width="74px" height="28px" borderRadius="8px" />
                                </div>
                            </div>

                            <div className="food-card__actions">
                                <SkeletonLine width="34px" height="34px" borderRadius="10px" />
                                <SkeletonLine width="34px" height="34px" borderRadius="10px" />
                                <SkeletonLine width="108px" height="34px" borderRadius="10px" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
