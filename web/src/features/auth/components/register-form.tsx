/* 【責務】
 * 新規登録フォームを描画し、認証成功時のコールバックへつなぐ。
 */

'use client';

import * as Label from '@radix-ui/react-label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type FocusEvent } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/app/provider';
import { signUpSchema, type SignUpInput } from '@/lib/auth';

type RegisterFormProps = {
  onSuccess: () => void;
};

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { signUp } = useAuth();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
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

  async function handleSubmit(values: SignUpInput): Promise<void> {
    setMessage(null);

    try {
      const result = await signUp({
        ...values,
        email: normalizeEmail(values.email),
      });

      if (result.session === null) {
        setMessage('確認メールを送信しました。メール確認後にログインしてください。');
        return;
      }

      onSuccess();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '新規登録に失敗しました。入力内容を確認してください。',
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
          autoComplete="new-password"
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
          'アカウントを作成する'
        )}
      </button>
    </form>
  );
}
