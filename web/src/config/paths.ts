export const paths = {
  home: {
    getHref: () => '/',
  },//urlを返すための関数　paths.home.getHref()　とかけば/が帰る

  auth: {
    login: {
      getHref: (redirectTo?: string | null) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,//ログイン前に行こうとしていたページを、ログイン後に復元できる
    },

//   たとえばユーザーが最初に行きたかったのが/app/historyだとします。でも未ログインなので、いったんログイン画面に飛ばします。
//   その時ただ/auth/loginに飛ばすだけだと、ログイン後に「元々どこへ行きたかったか」が消えます。
//一方、これを使うと/auth/login?redirectTo=%2Fapp%2Fhistoryになります。これならログイン後に   - redirectTo を読む - /app/history に戻すができます。
    register: {
      getHref: (redirectTo?: string | null) =>
        `/auth/register${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },//これは基本URLは /auth/loginだが、もし redirectTo があれば?redirectTo=... を後ろに付ける
  },

  app: {
    root: {
      getHref: () => '/app',
    },
    record: {
      getHref: () => '/app/record',
    },
    history: {
      getHref: () => '/app/history',
    },
    foods: {
      getHref: () => '/app/foods',
    },
    settings: {
      getHref: () => '/app/settings',
    },
  },
} as const;
