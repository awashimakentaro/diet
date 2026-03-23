'use client';

import { type FormEvent, type JSX, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useAuth } from '@/app/provider';

type AuthMode = 'sign-in' | 'sign-up';

function normalizeRedirectPath(candidate: string | null): string {
  if (candidate === null || candidate.startsWith('/app/') === false) {
    return '/app/record';
  }

  return candidate;
}


function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, status } = useAuth();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const redirectPath = normalizeRedirectPath(searchParams.get('redirect'));

  useEffect(() => {
    if (status === 'signed-in') {
      router.replace(redirectPath);
    }
  }, [redirectPath, router, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === 'sign-in') {
        await signIn({ email, password });
        router.replace(redirectPath);
      } else {
        const result = await signUp({ email, password });

        if (result.requiresEmailConfirmation) {
          setMessage('確認メールを送信しました。メール確認後にログインしてください。');
        } else {
          router.replace(redirectPath);
        }
      }
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : '認証に失敗しました。入力内容を確認してください。';
      setMessage(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <p className="eyebrow">認証</p>
          <h1>Diet Web にログイン</h1>
          <p>Supabase の既存アカウントでログインし、記録・履歴・食品ライブラリへ遷移します。</p>
        </div>

        <div className="auth-toggle" aria-label="認証モード" role="tablist">
          <button
            aria-selected={mode === 'sign-in'}
            className={mode === 'sign-in' ? 'tab-link tab-link--active' : 'tab-link'}
            onClick={() => setMode('sign-in')}
            type="button"
          >
            ログイン
          </button>
          <button
            aria-selected={mode === 'sign-up'}
            className={mode === 'sign-up' ? 'tab-link tab-link--active' : 'tab-link'}
            onClick={() => setMode('sign-up')}
            type="button"
          >
            新規登録
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>メールアドレス</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="diet@example.com"
              type="email"
              value={email}
            />
          </label>

          <label className="auth-field">
            <span>パスワード</span>
            <input
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="6文字以上で入力"
              type="password"
              value={password}
            />
          </label>

          {message !== null ? <p className="auth-message">{message}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? '送信中...' : mode === 'sign-in' ? 'ログインする' : 'アカウントを作成する'}
          </button>
        </form>
      </section>
    </main>
  );
}

/**
 * Suspense 境界付きでトップページの認証 UI を返す。
 * 呼び出し元: Next.js `/` ルート。
 * @returns 認証画面 JSX
 * @remarks 副作用は存在しない。
 */
function LoadingFallback(): JSX.Element {
  return (
    <main className="auth-page">
      <section className="auth-card auth-card--compact">
        <div className="auth-copy">
          <p className="eyebrow">読込中</p>
          <h1>ログイン画面を準備しています</h1>
          <p>セッション情報を確認した後に認証フォームを表示します。</p>
        </div>
      </section>
    </main>
  );
}

/**
 * `/` に認証画面を表示する。
 * 呼び出し元: Next.js `/` ルート。
 * @returns 認証画面 JSX
 * @remarks 副作用は存在しない。
 */
export default function HomePage(): JSX.Element {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
