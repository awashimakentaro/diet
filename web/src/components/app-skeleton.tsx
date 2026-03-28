/**
 * web/src/components/app-skeleton.tsx
 *
 * 【責務】
 * データ取得中に表示するスケルトン UI コンポーネントを提供する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - Home / History / Foods / Record の loading.tsx や screen から呼ばれる。
 * - 現在の実画面レイアウトに寄せた骨格だけを描画する。
 *
 * 【やらないこと】
 * - データ取得
 * - 画面 state 管理
 * - 画面遷移
 *
 * 【他ファイルとの関係】
 * - web/src/styles/globals.css の skeleton-* 系クラスに依存する。
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
            <div className="skeleton-home-grid">
                <div className="skeleton-home-stack">
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

                        <div className="skeleton-home-insights">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div className="skeleton-home-insight-card" key={index}>
                                    <div className="skeleton-row">
                                        <SkeletonLine width="40%" height="12px" />
                                        <SkeletonCircle size="8px" />
                                    </div>
                                    <SkeletonLine width="52%" height="24px" style={{ marginTop: 12 }} />
                                    <SkeletonLine width="100%" height="12px" style={{ marginTop: 10 }} />
                                    <SkeletonLine width="76%" height="12px" style={{ marginTop: 6 }} />
                                </div>
                            ))}
                        </div>
                    </SkeletonCard>
                </div>

                <div className="skeleton-home-stack">
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

                    <div className="skeleton-home-side-row">
                        <SkeletonCard>
                            <SkeletonLine width="34%" height="10px" />
                            <SkeletonLine width="52%" height="18px" style={{ marginTop: 8 }} />
                            <SkeletonLine width="48%" height="52px" borderRadius="18px" style={{ marginTop: 22 }} />
                            <SkeletonLine width="100%" height="12px" style={{ marginTop: 18 }} />
                            <SkeletonLine width="88%" height="12px" style={{ marginTop: 8 }} />
                        </SkeletonCard>

                        <SkeletonCard>
                            <SkeletonLine width="34%" height="10px" />
                            <SkeletonLine width="56%" height="18px" style={{ marginTop: 8 }} />
                            <SkeletonLine width="92%" height="12px" style={{ marginTop: 18 }} />
                            <div className="skeleton-bar-chart" style={{ marginTop: 18 }}>
                                {SKELETON_BAR_HEIGHTS.map((height, i) => (
                                    <div key={i} className="skeleton-bar-col">
                                        <SkeletonLine width="100%" height="12px" borderRadius="8px" style={{ marginBottom: 8 }} />
                                        <SkeletonLine
                                            width="100%"
                                            height={height}
                                            borderRadius="10px"
                                        />
                                        <SkeletonLine width="100%" height="10px" style={{ marginTop: 6 }} />
                                    </div>
                                ))}
                            </div>
                        </SkeletonCard>
                    </div>
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
