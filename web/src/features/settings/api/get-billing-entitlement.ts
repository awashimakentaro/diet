import { getSupabaseBrowserClient } from '@/lib/supabase';

export type BillingEntitlement = {
  plan: 'free' | 'pro';
  aiWeeklyLimit: number;
  aiWeeklyUsed: number;
  aiUnlimited: boolean;
  subscriptionStatus: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
};

type EntitlementRow = {
  plan: string | null;
  ai_weekly_limit: number | null;
  ai_unlimited: boolean | null;
  subscription_status: string | null;
  cancel_at_period_end: boolean | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
};

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getJstWeekStartIso(now = new Date()): string {
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
  const jstDay = jstNow.getUTCDay();
  const daysSinceMonday = (jstDay + 6) % 7;
  const startUtcMs = Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
  ) - (daysSinceMonday * 24 * 60 * 60 * 1000) - JST_OFFSET_MS;

  return new Date(startUtcMs).toISOString();
}

export async function getBillingEntitlement(): Promise<BillingEntitlement> {
  const supabase = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('ログイン状態を確認できません。');
  }

  const { data, error } = await supabase
    .from('user_entitlements')
    .select('plan, ai_weekly_limit, ai_unlimited, subscription_status, cancel_at_period_end, current_period_end, stripe_customer_id')
    .eq('user_id', userData.user.id)
    .maybeSingle<EntitlementRow>();

  if (error) {
    throw new Error(error.message);
  }

  const { count, error: usageError } = await supabase
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)
    .gte('created_at', getJstWeekStartIso());

  if (usageError) {
    throw new Error(usageError.message);
  }

  const plan = data?.plan === 'pro' ? 'pro' : 'free';

  return {
    plan,
    aiWeeklyLimit: typeof data?.ai_weekly_limit === 'number'
      ? data.ai_weekly_limit
      : plan === 'pro'
        ? 20
        : 5,
    aiWeeklyUsed: count ?? 0,
    aiUnlimited: data?.ai_unlimited === true,
    subscriptionStatus: data?.subscription_status ?? null,
    cancelAtPeriodEnd: data?.cancel_at_period_end === true,
    currentPeriodEnd: data?.current_period_end ?? null,
    stripeCustomerId: data?.stripe_customer_id ?? null,
  };
}
