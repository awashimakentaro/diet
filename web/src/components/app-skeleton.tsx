/*
 * 【責務】
 * データ取得中に表示するスケルトン UI コンポーネントを提供する。
 */

import type { CSSProperties, JSX } from 'react';

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

type SkeletonCircleProps = {
    size?: string;
    style?: CSSProperties;
};

export function SkeletonCircle({
    size = '120px',
    style,
}: SkeletonCircleProps): JSX.Element {
    return (
        <div
            className="skeleton-shimmer"
            style={{ width: size, height: size, borderRadius: '999px', ...style }}
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
        <div className="skeleton-screen skeleton-screen--home">
            <div className="skeleton-loading-note">
                <SkeletonCircle size="18px" />
                <span>今日の記録を読み込んでいます</span>
            </div>
            <div className="skeleton-home-grid">
                <div className="skeleton-home-stack">
                    <SkeletonCard className="skeleton-home-action-card">
                        <SkeletonLine width="28%" height="11px" />
                        <SkeletonLine width="68%" height="40px" style={{ marginTop: 10 }} />
                        <SkeletonLine width="82%" height="14px" style={{ marginTop: 8 }} />
                        <SkeletonLine width="120px" height="44px" borderRadius="999px" style={{ marginTop: 12 }} />
                    </SkeletonCard>

                    <SkeletonCard className="skeleton-card--large">
                        <SkeletonLine width="34%" height="11px" />
                        <SkeletonLine width="42%" height="30px" style={{ marginTop: 10 }} />

                        <div className="skeleton-home-summary">
                            <SkeletonCircle size="136px" />

                            <div className="skeleton-home-summary-copy">
                                <SkeletonLine width="62%" height="18px" />
                                <SkeletonLine width="78%" height="18px" />
                                <SkeletonLine width="68%" height="18px" />
                                <SkeletonLine width="100%" height="72px" borderRadius="22px" style={{ marginTop: 8 }} />
                            </div>
                        </div>
                    </SkeletonCard>

                    <SkeletonCard>
                        <SkeletonLine width="24%" height="10px" />
                        <SkeletonLine width="32%" height="18px" style={{ marginTop: 8 }} />
                        <SkeletonLine width="52%" height="40px" style={{ marginTop: 18 }} />
                        <div className="skeleton-row" style={{ marginTop: 16 }}>
                            <SkeletonLine width="30%" height="36px" borderRadius="14px" />
                            <SkeletonLine width="30%" height="36px" borderRadius="14px" />
                            <SkeletonLine width="30%" height="36px" borderRadius="14px" />
                        </div>
                    </SkeletonCard>
                </div>

                <div className="skeleton-home-stack">
                    <SkeletonCard>
                        <SkeletonLine width="20%" height="18px" />
                        <SkeletonLine width="58%" height="42px" style={{ marginTop: 22 }} />
                    </SkeletonCard>

                    <SkeletonCard>
                        <SkeletonLine width="30%" height="10px" />
                        <SkeletonLine width="36%" height="18px" style={{ marginTop: 8 }} />

                        <div className="skeleton-home-weight-summary">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div className="skeleton-home-weight-stat" key={index}>
                                    <SkeletonLine width="50%" height="12px" />
                                    <SkeletonLine width="62%" height="34px" style={{ marginTop: 18 }} />
                                </div>
                            ))}
                        </div>

                        <SkeletonLine width="100%" height="156px" borderRadius="26px" style={{ marginTop: 16 }} />
                    </SkeletonCard>
                </div>
            </div>
        </div>
    );
}

/** Record 画面用のスケルトン */
export function RecordScreenSkeleton(): JSX.Element {
    return (
        <div className="skeleton-screen skeleton-screen--record">
            <SkeletonCard className="skeleton-card--large">
                <SkeletonLine width="18%" height="11px" />
                <SkeletonLine width="34%" height="30px" style={{ marginTop: 10 }} />
                <SkeletonLine width="82%" height="12px" style={{ marginTop: 12 }} />
                <SkeletonLine width="70%" height="12px" style={{ marginTop: 8 }} />

                <div className="skeleton-record-guides">
                    <div className="skeleton-record-guide">
                        <SkeletonCircle size="18px" />
                        <div style={{ display: 'grid', gap: 8 }}>
                            <SkeletonLine width="140px" height="14px" />
                            <SkeletonLine width="100%" height="12px" />
                            <SkeletonLine width="82%" height="12px" />
                        </div>
                    </div>

                    <div className="skeleton-record-guide">
                        <SkeletonCircle size="18px" />
                        <div style={{ display: 'grid', gap: 8 }}>
                            <SkeletonLine width="96px" height="14px" />
                            <SkeletonLine width="100%" height="12px" />
                            <SkeletonLine width="78%" height="12px" />
                        </div>
                    </div>
                </div>
            </SkeletonCard>

            <SkeletonCard className="skeleton-record-quick-card">
                <div className="skeleton-record-prompt-box">
                    <SkeletonLine width="100%" height="112px" borderRadius="24px" />
                </div>

                <div className="skeleton-record-toolbar">
                    <div className="skeleton-record-tools">
                        <SkeletonLine width="108px" height="38px" borderRadius="999px" />
                        <SkeletonLine width="88px" height="38px" borderRadius="999px" />
                        <SkeletonLine width="94px" height="38px" borderRadius="999px" />
                    </div>

                    <SkeletonCircle size="46px" />
                </div>
            </SkeletonCard>
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
