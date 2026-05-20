/* 【責務】
 * ログインフォームを描画し、認証成功時のコールバックへつなぐ。
 */

'use client';

import * as Label from '@radix-ui/react-label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type FocusEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/provider';
import { loginInputSchema, type LoginInput } from '@/lib/auth';

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const emailRegistration = form.register('email');

  function normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  function handleEmailBlur(event: FocusEvent<HTMLInputElement>): void {
    form.setValue('email', normalizeEmail(event.target.value), {
      shouldDirty: true,
      shouldValidate: false,
    });
    void emailRegistration.onBlur(event);
  }

  async function handleSubmit(values: LoginInput): Promise<void> {
    setMessage(null);

    try {
      await signIn({
        ...values,
        email: normalizeEmail(values.email),
      });
      onSuccess();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'ログインに失敗しました。入力内容を確認してください。',
      );
    }
  }

  return (
    <form className="auth-form" noValidate onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="auth-field">
        <Label.Root htmlFor="email">メールアドレス</Label.Root>
        <input
          aria-invalid={form.formState.errors.email ? 'true' : 'false'}
          autoComplete="email"
          id="email"
          placeholder="diet@example.com"
          type="email"
          {...emailRegistration}
          onBlur={handleEmailBlur}
        />
        {form.formState.errors.email ? (
          <p className="auth-message" role="alert">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="auth-field">
        <Label.Root htmlFor="password">パスワード</Label.Root>
        <input
          aria-invalid={form.formState.errors.password ? 'true' : 'false'}
          autoComplete="current-password"
          id="password"
          placeholder="6文字以上で入力"
          type="password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="auth-message" role="alert">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      {message !== null ? <p className="auth-message" role="alert">{message}</p> : null}

      <button
        className="primary-button"
        disabled={form.formState.isSubmitting}
        type="submit"
      >
        {form.formState.isSubmitting ? (
          <>
            <span className="record-screen__loading-spinner record-screen__loading-spinner--inline" />
            <span>送信中...</span>
          </>
        ) : (
          'ログインする'
        )}
      </button>
    </form>
  );
}
