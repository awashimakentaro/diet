'use client';

/*
 * 【責務】
 * 公開トップ `/` 専用の LP を描画し、ログイン / 新規登録 / アプリ遷移導線を配置する。
 */

import { ArrowRight, Dumbbell } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, JSX } from 'react';

import { useWebAuth } from '@/app/provider';
import { paths } from '@/config/paths';

const LIVE_COMMENTS = [
  'カロリー管理は楽にできるのが一番ですからねぇ😎',
  '筋トレ友達に「俺今カロリーとpfc管理だるすぎるから簡単にそれらを記録するアプリ作ってんだぁ」って言ったら「厳しって( ・∇・)」って怒られた。悲しい',
  '昨日二郎を食べてしまいました...会津若松の二郎ラーメン美味しいからみんな食べようね。',
] as const;

function buildLiveCommentStyle(index: number): CSSProperties {
  return {
    '--comment-delay': `${2.6 + index * 3.2}s`,
    '--comment-top': `${index * 46}px`,
  } as CSSProperties;
}

export function LandingPageScreen(): JSX.Element {
  const { status } = useWebAuth();
  const isSignedIn = status === 'signed-in';

  return (
    <main className="landing-screen">
      <div className="landing-screen__live-comments" aria-hidden="true">
        {LIVE_COMMENTS.map((comment, index) => (
          <span className="landing-screen__live-comment" key={comment} style={buildLiveCommentStyle(index)}>
            {comment}
          </span>
        ))}
      </div>
      <section className="landing-screen__hero">
        <header className="landing-screen__topbar">
          <Link className="landing-screen__brand" href={paths.home.getHref()}>
            <span className="landing-screen__brand-icon">
              <Dumbbell aria-hidden="true" size={18} strokeWidth={2.5} />
            </span>
            <span className="landing-screen__brand-mark">PFC TRACKER</span>
          </Link>
        </header>

        <div className="landing-screen__hero-grid">
          <div className="landing-screen__hero-copy">
            <p className="landing-screen__eyebrow">AI FOOD LOG / TRAINING LIFE</p>
            <h1>
              NO MORE
              <span>面倒な食事管理。</span>
            </h1>
            <p className="landing-screen__lead">
              写真から記録して、PFC とトレーニングの流れだけ見る。細かい入力に時間を使わないための食事管理アプリ。
            </p>

            <div className="landing-screen__hero-actions">
              {isSignedIn ? (
                <Link className="landing-screen__cta landing-screen__cta--primary" href={paths.app.root.getHref()}>
                  Home を開く
                  <ArrowRight aria-hidden="true" size={17} strokeWidth={2.6} />
                </Link>
              ) : (
                <>
                  <Link className="landing-screen__cta landing-screen__cta--primary" href={paths.auth.register.getHref()}>
                    新規登録して始める
                    <ArrowRight aria-hidden="true" size={17} strokeWidth={2.6} />
                  </Link>
                  <Link className="landing-screen__cta landing-screen__cta--secondary" href={paths.auth.login.getHref()}>
                    ログイン
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="landing-screen__impact">
            <Image
              priority
              alt="ジムでスマートフォンを見ながら食事管理をするトレーニング中の男性"
              className="landing-screen__athlete-image"
              height={1024}
              src="/landing/gym-athlete-hero.png"
              width={1536}
            />
            <div className="landing-screen__speech-stack" aria-label="PFC Tracker のひとこと">
              <div className="landing-screen__speech-bubble landing-screen__speech-bubble--first">楽だよ！</div>
              <div className="landing-screen__speech-bubble landing-screen__speech-bubble--second">
                めんどくさがりでも続くよ
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
