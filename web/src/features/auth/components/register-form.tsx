'use client';

  import * as Label from '@radix-ui/react-label';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useState } from 'react';
  import { useForm } from 'react-hook-form';

  import { useAuth } from '@/app/provider';
  import { signUpSchema, type SignUpInput } from '@/lib/auth';

  type RegisterFormProps = {
    onSuccess: () => void;
  };

  export function RegisterForm({ onSuccess }: RegisterFormProps){
    const { signUp } = useAuth();
    const [message, setMessage] = useState<string | null>(null);

    const form = useForm<SignUpInput>({
      resolver: zodResolver(signUpSchema),
      defaultValues: {
        email: '',
        password: '',
      },
    });

    async function handleSubmit(values: SignUpInput): Promise<void> {
      setMessage(null);

      try {
        const result = await signUp(values);

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
            id="email"
            autoComplete="email"
            placeholder="diet@example.com"
            type="email"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="auth-message">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="auth-field">
          <Label.Root htmlFor="password">パスワード</Label.Root>
          <input
            id="password"
            autoComplete="new-password"
            placeholder="6文字以上で入力"
            type="password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="auth-message">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        {message !== null ? <p className="auth-message">{message}</p> : null}

        <button
          className="primary-button"
          disabled={form.formState.isSubmitting}
          type="submit"
        >
          {form.formState.isSubmitting ? '送信中...' : 'アカウントを作成する'}
        </button>
      </form>
    );
  }