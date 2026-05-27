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
  'このコメントたちかわいい好き',
  'feadbackが欲しい',
  '早くrefactしないといけないのにskillsが楽しい困った。',
  'プログラミングできるようになりたいなー',
] as const;

const LIVE_COMMENT_LANES = 4;
const LIVE_COMMENT_LANES_DATA = Array.from({ length: LIVE_COMMENT_LANES }, (_, laneIndex) => (
  LIVE_COMMENTS.filter((_, commentIndex) => commentIndex % LIVE_COMMENT_LANES === laneIndex)
));

const PFC_ITEMS = [
  {
    label: 'P',
    title: 'Protein',
    body: 'たんぱく質。筋肉や体の材料になり、減量中も増量中もまず不足させたくない栄養素です。',
  },
  {
    label: 'F',
    title: 'Fat',
    body: '脂質。ホルモンや体調維持に関わるため、ただ削ればいいものではありません。',
  },
  {
    label: 'C',
    title: 'Carbohydrate',
    body: '炭水化物。日常生活やトレーニングの燃料になるため、動く日は特に判断材料になります。',
  },
] as const;

const DIET_PRINCIPLES = [
  {
    title: '体重は収支で動く',
    body: '減量では摂取を消費より少なく、増量では摂取を消費より多くするのが基本です。',
  },
  {
    title: 'カロリーだけでは足りない',
    body: '同じ kcal でも、PFC の配分で満腹感、筋肉量、トレーニングの調子は変わります。',
  },
  {
    title: '続けられる記録が勝つ',
    body: '完璧な入力より、食事・体重・ワークアウトを途切れず残せることを優先します。',
  },
] as const;

const TRACKING_ITEMS = [
  '食事の摂取カロリー',
  'PFC バランス',
  '体重推移',
  '筋トレメニュー',
  'その他ワークアウト',
  '1日のカロリー収支',
] as const;

function buildLiveCommentLaneStyle(index: number, commentCount: number): CSSProperties {
  return {
    '--comment-delay': `${2.2 + index * 1.4}s`,
    '--comment-duration': `${Math.max(18, commentCount * 9)}s`,
    '--comment-top': `${index * 48}px`,
  } as CSSProperties;
}

export function LandingPageScreen(): JSX.Element {
  const { status } = useWebAuth();
  const isSignedIn = status === 'signed-in';

  return (
    <main className="landing-screen">
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
              PFCで
              <span>食事管理を迷わない。</span>
            </h1>
            <p className="landing-screen__lead">
              PFC Tracker は、食事・体重・筋トレ・ワークアウトをまとめて記録し、今日のカロリー収支と栄養バランスを見える化するアプリです。
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
            <div className="landing-screen__live-comments" aria-hidden="true">
              {LIVE_COMMENT_LANES_DATA.map((comments, index) => (
                <div
                  className="landing-screen__live-comment-lane"
                  key={`comment-lane-${index}`}
                  style={buildLiveCommentLaneStyle(index, comments.length)}
                >
                  <div className="landing-screen__live-comment-track">
                    {comments.map((comment) => (
                      <span className="landing-screen__live-comment" key={comment}>
                        {comment}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="landing-screen__speech-stack" aria-label="PFC Tracker のひとこと">
              <div className="landing-screen__speech-bubble landing-screen__speech-bubble--first">楽だよ！</div>
              <div className="landing-screen__speech-bubble landing-screen__speech-bubble--second">
                めんどくさがりでも続くよ
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-screen__section landing-screen__section--education">
        <div className="landing-screen__section-head">
          <p className="landing-screen__eyebrow">WHAT IS PFC</p>
          <h2>
            PFCとは、
            <span>体づくりの基本になる3つの栄養素。</span>
          </h2>
          <p>
            PFC は Protein / Fat / Carbohydrate の略です。Diet では「何 kcal 食べたか」だけでなく、
            その kcal が何から来ているかを見ることで、減量・増量・維持の判断がしやすくなります。
          </p>
        </div>

        <div className="landing-screen__pfc-grid">
          {PFC_ITEMS.map((item) => (
            <article className="landing-screen__pfc-item" key={item.label}>
              <strong>{item.label}</strong>
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-screen__section landing-screen__section--principle">
        <div className="landing-screen__section-head">
          <p className="landing-screen__eyebrow">DIET PRINCIPLE</p>
          <h2>
            Dietで大事なのは、
            <span>摂取・消費・継続。</span>
          </h2>
        </div>

        <div className="landing-screen__principle-grid">
          {DIET_PRINCIPLES.map((item) => (
            <article className="landing-screen__principle-item" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-screen__section landing-screen__section--product">
        <div className="landing-screen__product-copy">
          <p className="landing-screen__eyebrow">WHY THIS APP</p>
          <h2>
            痩せるためだけじゃなく、
            <span>判断するための記録。</span>
          </h2>
          <p>
            写真やテキストから食事を残し、保存メニューやワークアウトを再利用する。
            Home では摂取カロリーから基礎代謝とトレーニング消費を引いた、今日の収支を確認できます。
          </p>
        </div>

        <div className="landing-screen__tracking-list" aria-label="PFC Tracker で記録できるもの">
          {TRACKING_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <footer className="landing-screen__footer">
        <Link href={paths.legal.terms.getHref()}>利用規約</Link>
        <Link href={paths.legal.privacy.getHref()}>プライバシーポリシー</Link>
        <Link href={paths.legal.commerce.getHref()}>特定商取引法に基づく表記</Link>
        <Link href={paths.legal.contact.getHref()}>お問い合わせ</Link>
      </footer>
    </main>
  );
}
