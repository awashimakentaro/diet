"use client";

import { useAuth } from "@/app/provider";
import { paths } from "@/config/paths";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); //useSearchParams()/はURL のクエリパラメータを読む hook
  const redirectTo = searchParams?.get("redirectTo"); //もしも　urlが/auth/login?redirectTo=/app/historyなら　redirectTo === '/app/history'
  const { status, user } = useAuth();
  const isLoginPage = pathname === "/auth/login";
  const title = isLoginPage
    ? "Diet Web にログイン"
    : "Diet Web アカウントを作成";

  useEffect(() => {//ログイン済みの人がlogin or register にきた場合元の場所にredrectする
    if (status === 'signed-in' && user !== null) {
      router.replace(
        `${redirectTo ? `${decodeURIComponent(redirectTo)}` : paths.app.record.getHref()}`,
      );
    }
  }, [status, user, router, redirectTo]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-copy">
          <h1>{title}</h1>
        </div>

        <div className="auth-toggle" aria-label="認証ページ切り替え">
          <Link
            className={isLoginPage ? "tab-link tab-link--active" : "tab-link"}
            href={paths.auth.login.getHref(redirectTo)}
          >
            ログイン
          </Link>
          <Link
            className={isLoginPage ? "tab-link" : "tab-link tab-link--active"}
            href={paths.auth.register.getHref(redirectTo)}
          >
            新規登録
          </Link>
        </div>

        {children}
      </section>
    </main>
  );
}
