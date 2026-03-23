"use client";

import { createContext, useContext } from "react";

import { login, logout, signUp, useUser } from "@/lib/auth";

const AuthContext = createContext<any>(null);
//createContext(...)React の共有箱を作る関数  useContext ボックスの中身を読む

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, mutate } = useUser();

  const status = isLoading ? "checking" : user ? "signed-in" : "signed-out";

  async function signIn(input: { email: string; password: string }) {
    await login(input);
    await mutate();
  }

  async function handleSignOut() {
    await logout();
    await mutate(null, false);
  }

  async function handleSignUp(input: { email: string; password: string }) {
    const result = await signUp(input);
    await mutate();
    return result;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        signIn,
        signOut: handleSignOut,
        signUp: handleSignUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
//「children 配下のすべてのコンポーネントに、user や status や signIn を共有する value は配るデータです。たとえば子コンポーネントでconst { user, status, signIn } = useAuth();と取れるのは、この value を Provider が流しているから
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("AuthProviderの内側でuseAuthを呼んでください");
  }
  return context;
}
//useAuth() はAuthProvider が共有した user や signIn を取り出すための入口
