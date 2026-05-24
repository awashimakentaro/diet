/* 【責務】
 * Google 新規登録ボタンを描画し、Supabase OAuth へつなぐ。
 */

'use client';

import { useState } from 'react';

import { useAuth } from '@/app/provider';

const TEST_ACCOUNT_EMAIL = 'TestUser@test.com';
const TEST_ACCOUNT_PASSWORD = 'testtest';
const isTestLoginEnabled = process.env.NODE_ENV !== 'production'
  || process.env.NEXT_PUBLIC_ENABLE_TEST_LOGIN === 'true';

type RegisterFormProps = {
  demoRedirectTo: string;
  redirectTo: string;
};

export function RegisterForm({ demoRedirectTo, redirectTo }: RegisterFormProps) {
  const { signIn, signInWithGoogle } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleGoogleSignUp(): Promise<void> {
    setMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithGoogle(redirectTo);
    } catch (error) {
      setIsSubmitting(false);
      setMessage(
        error instanceof Error
          ? error.message
          : 'Google での登録に失敗しました。時間をおいて再度お試しください。',
      );
    }
  }

  async function handleTestSignIn(): Promise<void> {
    setMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({
        email: TEST_ACCOUNT_EMAIL,
        password: TEST_ACCOUNT_PASSWORD,
      });
      window.location.assign(demoRedirectTo);
    } catch (error) {
      setIsSubmitting(false);
      setMessage(
        error instanceof Error
          ? error.message
          : 'テストアカウントでのログインに失敗しました。',
      );
    }
  }

  return (
    <div className="auth-form">
      <section className="auth-method auth-method--primary">
        <div className="auth-method__copy">
          <span>通常利用</span>
          <p>Google アカウントで登録して、初期設定へ進みます。</p>
        </div>
        <button
          className="auth-google-button"
          disabled={isSubmitting}
          onClick={() => {
            void handleGoogleSignUp();
          }}
          type="button"
        >
          <span className="auth-google-button__mark" aria-hidden="true">G</span>
          <span>{isSubmitting ? 'Google に接続中...' : 'Google で始める'}</span>
        </button>
        <p className="auth-oauth-note">
          メールアドレスとパスワードは Google の認証画面で入力します。
        </p>
      </section>

      {isTestLoginEnabled ? (
        <section className="auth-method auth-method--demo">
          <div className="auth-method__copy">
            <span>開発 / お試し用</span>
            <p>固定のテストアカウントでアプリを確認します。</p>
          </div>
          <button
            className="auth-demo-button"
            disabled={isSubmitting}
            onClick={() => {
              void handleTestSignIn();
            }}
            type="button"
          >
            テストアカウントで入る
          </button>
        </section>
      ) : null}

      {message !== null ? <p className="auth-message" role="alert">{message}</p> : null}
    </div>
  );
}
