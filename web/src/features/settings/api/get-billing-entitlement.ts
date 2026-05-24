import { getSupabaseBrowserClient } from '@/lib/supabase';

export type BillingEntitlement = {
  plan: 'free' | 'pro';
  aiWeeklyLimit: number;
  aiUnlimited: boolean;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
};

type EntitlementRow = {
  plan: string | null;
  ai_weekly_limit: number | null;
  ai_unlimited: boolean | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
};

export async function getBillingEntitlement(): Promise<BillingEntitlement> {
  const supabase = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('ログイン状態を確認できません。');
  }

  const { data, error } = await supabase
    .from('user_entitlements')
    .select('plan, ai_weekly_limit, ai_unlimited, subscription_status, stripe_customer_id')
    .eq('user_id', userData.user.id)
    .maybeSingle<EntitlementRow>();

  if (error) {
    throw new Error(error.message);
  }

  const plan = data?.plan === 'pro' ? 'pro' : 'free';

  return {
    plan,
    aiWeeklyLimit: typeof data?.ai_weekly_limit === 'number'
      ? data.ai_weekly_limit
      : plan === 'pro'
        ? 20
        : 5,
    aiUnlimited: data?.ai_unlimited === true,
    subscriptionStatus: data?.subscription_status ?? null,
    stripeCustomerId: data?.stripe_customer_id ?? null,
  };
}
