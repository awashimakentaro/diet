"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

import { login, logout, signUp, useUser } from "@/lib/auth";

type AuthStatus = "checking" | "signed-in" | "signed-out";

type AuthContextValue = {
  user: User | null | undefined;
  status: AuthStatus;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (input: { email: string; password: string }) => Promise<Awaited<ReturnType<typeof signUp>>>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, mutate } = useUser();

  const status: AuthStatus = isLoading ? "checking" : user ? "signed-in" : "signed-out";

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

export { AuthProvider as AppProvider, useAuth as useWebAuth };
