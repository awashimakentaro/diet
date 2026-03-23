/**
 * web/src/components/web-auth-screen.tsx
 *
 * 【責務】
 * Web 版のログイン / サインアップ画面を描画し、認証成功後に目的ページへ遷移させる。
 *
 * 【使用箇所】
 * - web/src/app/page.tsx から `/` の初期画面として利用される。
 *
 * 【やらないこと】
 * - 認証状態の永続保持
 * - `/app/*` のガード判定
 * - 食事データの取得
 *
 * 【他ファイルとの関係】
 * - web/src/providers/web-auth-provider.tsx の認証 API を利用する。
 * - web/src/styles/globals.css の認証画面用クラスに依存する。
 */

'use client';

import { type FormEvent, type JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useWebAuth } from '@/providers/web-auth-provider';

type AuthMode = 'sign-in' | 'sign-up';

/**
 * ログイン成功後の遷移先を安全な `/app/*` パスへ正規化する。
 * 呼び出し元: WebAuthScreen。
 * @param candidate URL クエリから受け取った候補値
 * @returns 安全な遷移先パス
 * @remarks 副作用は存在しない。
 */
function normalizeRedirectPath(candidate: string | null): string {
  if (candidate === null || candidate.startsWith('/app/') === false) {
    return '/app/record';
  }

  return candidate;
}

/**
 * 認証画面を描画する。
 * 呼び出し元: Next.js `/` ルート。
 * @param props.redirectPathCandidate ログイン成功後に戻したい候補パス
 * @returns ログイン / サインアップ画面 JSX
 * @remarks 副作用: 認証成功時に router による画面遷移を発生させる。
 */
type WebAuthScreenProps = {
  redirectPathCandidate: string | null;
};

/**
 * 認証画面を描画する。
 * 呼び出し元: Next.js `/` ルート。
 * @param props.redirectPathCandidate ログイン成功後に戻したい候補パス
 * @returns ログイン / サインアップ画面 JSX
 * @remarks 副作用: 認証成功時に router による画面遷移を発生させる。
 */
export function WebAuthScreen({
  redirectPathCandidate,
}: WebAuthScreenProps): JSX.Element {
  const router = useRouter();
  const { signIn, signUp, status } = useWebAuth();

  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const redirectPath = normalizeRedirectPath(redirectPathCandidate);

  useEffect(() => {
    if (status === 'signed-in') {
      router.replace(redirectPath);
    }
  }, [redirectPath, router, status]);

  /**
   * ログインまたはサインアップ処理を実行する。
   * 呼び出し元: フォーム submit イベント。
   * @param event フォーム送信イベント
   * @returns Promise<void>
   * @remarks 副作用: Supabase 認証 API 呼び出しと画面メッセージ更新を行う。
   */
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

        <div className="auth-toggle" role="tablist" aria-label="認証モード">
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
