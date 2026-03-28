'use client';

/**
 * web/src/features/landing/landing-screen.tsx
 *
 * 【責務】
 * 公開トップの LP と、ログイン / 新規登録導線を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `/` ルートから呼ばれる。
 * - 未ログイン時は認証導線、ログイン済み時はアプリへ進む導線を表示する。
 *
 * 【やらないこと】
 * - 認証 API の直接呼び出し
 * - アプリ本体データの取得
 * - 食事記録編集
 *
 * 【他ファイルとの関係】
 * - app/provider.tsx の useWebAuth を利用する。
 * - config/paths.ts を利用する。
 * - web/src/styles/globals.css の landing-screen 系クラスに依存する。
 */

import Link from 'next/link';
import type { JSX } from 'react';

import { useWebAuth } from '@/app/provider';
import { paths } from '@/config/paths';

const LANDING_STEPS = [
  {
    eyebrow: 'STEP 1',
    title: '写真やテキストから、食事をすぐ記録',
    description: '料理写真か一言メモを送るだけで、AI が食品候補と栄養情報の下書きを作成します。',
    image: '/tutorial/step1.png',
  },
  {
    eyebrow: 'STEP 2',
    title: 'プロフィールから目標を整える',
    description: '体重や活動量を入力すると、PFC と摂取カロリーの目標を保存して管理できます。',
    image: '/tutorial/step2.png',
  },
  {
    eyebrow: 'STEP 3',
    title: '履歴と体重推移を見返して改善',
    description: '食事履歴、食品ライブラリ、栄養状況、体重推移を一つの流れで振り返れます。',
    image: '/tutorial/step3.png',
  },
] as const;

export function LandingScreen(): JSX.Element {
  const { status } = useWebAuth();
  const isSignedIn = status === 'signed-in';

  return (
    <main className="landing-screen">
      <section className="landing-screen__hero">
        <header className="landing-screen__topbar">
          <Link className="landing-screen__brand" href={paths.home.getHref()}>
            <span className="landing-screen__brand-mark">PFC TRACKER</span>
          </Link>
        </header>

        <div className="landing-screen__hero-grid">
          <div className="landing-screen__hero-copy">
            <p className="landing-screen__eyebrow">AI FOOD TRACKING</p>
            <h1>食事管理を、迷わず続けられる形にする。</h1>
            <p className="landing-screen__lead">
              写真やテキストから食事を記録し、PFC バランス、履歴、体重推移まで一つの流れで管理できる食事記録アプリです。
            </p>

            <div className="landing-screen__hero-actions">
              {isSignedIn ? (
                <Link className="landing-screen__cta landing-screen__cta--primary" href={paths.app.root.getHref()}>
                  Home を開く
                </Link>
              ) : (
                <>
                  <Link className="landing-screen__cta landing-screen__cta--primary" href={paths.auth.register.getHref()}>
                    新規登録して始める
                  </Link>
                  <Link className="landing-screen__cta landing-screen__cta--secondary" href={paths.auth.login.getHref()}>
                    ログイン
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="landing-screen__hero-card">
            <div className="landing-screen__hero-card-copy">
              <p>使い方の流れ</p>
              <strong>最初の2分で準備完了</strong>
              <span>登録後はプロフィールを入力し、そのまま `/app` の Home から使い始められます。</span>
            </div>
            <img
              alt="PFC Tracker の使い方"
              className="landing-screen__hero-image"
              src="/tutorial/step1.png"
            />
          </div>
        </div>
      </section>

      <section className="landing-screen__section">
        <div className="landing-screen__section-head">
          <p className="landing-screen__eyebrow">HOW IT WORKS</p>
          <h2>使い方</h2>
        </div>

        <div className="landing-screen__steps">
          {LANDING_STEPS.map((step) => (
            <article className="landing-screen__step-card" key={step.title}>
              <div className="landing-screen__step-copy">
                <p>{step.eyebrow}</p>
                <h3>{step.title}</h3>
                <span>{step.description}</span>
              </div>
              <img alt={step.title} className="landing-screen__step-image" src={step.image} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
