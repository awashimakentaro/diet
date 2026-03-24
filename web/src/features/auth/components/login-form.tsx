//ここに承認画面専用uiを置く
//features/auth/components ログイン画面と登録画面の見た目を作る

'use client';
  import * as Label from '@radix-ui/react-label';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { useState } from 'react';
  import { useForm } from 'react-hook-form';
  import { useAuth } from '@/app/provider';
  import { loginInputSchema, type LoginInput } from '@/lib/auth';

  type LoginFormProps = {
    onSuccess: () => void;//LoginFormProps 型のオブジェクトは、onSuccess という名前の関数プロパティを持つ
  };

  export function LoginForm({ onSuccess }: LoginFormProps){
    const { signIn } = useAuth();
    const [message, setMessage] = useState<string | null>(null);

    const form = useForm<LoginInput>({
      resolver: zodResolver(loginInputSchema),
      defaultValues: {
        email: '',
        password: '',
      },
    });

    async function handleSubmit(values: LoginInput): Promise<void> {
      setMessage(null);

      try {
        await signIn(values);
        onSuccess();//onSuccess はこのコードの中では「まだ中身が決まっていない関数」です
      } catch (error) {//このerrorはlogin()失敗によるsupabaseから帰るerror
        setMessage(
          error instanceof Error//error が Error 型のオブジェクトかどうかを確認している
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
            autoComplete="current-password"
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
          {form.formState.isSubmitting ? '送信中...' : 'ログインする'}
        </button>
      </form>
    );
  }
//form.handleSubmit(handleSubmit)送信されたら、RHF でチェックして、OKならこの handleSubmit を実行してという意味
//form.handleSubmit とhandleSubmitは別物　form.handleSubmitこれは React Hook Form が最初から持っている関数ですuseForm() を呼ぶと返ってきます。