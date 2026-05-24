import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function startBillingCheckout(): Promise<string> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    throw new Error('ログイン状態を確認できません。');
  }

  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const payload = await response.json() as { url?: string; message?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.message ?? 'Checkoutを開始できませんでした。');
  }

  return payload.url;
}
