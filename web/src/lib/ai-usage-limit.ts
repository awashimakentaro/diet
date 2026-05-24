import { createClient } from '@supabase/supabase-js';

type AiFeature = 'meal' | 'workout';

type AiUsageLimitResult = {
  remaining: number;
  userId: string;
};

type UserEntitlementRow = {
  plan: string | null;
  ai_weekly_limit: number | null;
  ai_unlimited: boolean | null;
};

export class AiUsageLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiUsageLimitExceededError';
  }
}

const FREE_WEEKLY_AI_LIMIT = 5;
const PRO_WEEKLY_AI_LIMIT = 20;

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');

  if (authorization === null || !authorization.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return authorization.slice('bearer '.length).trim();
}

function getJstWeekStartIso(now = new Date()): string {
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffsetMs);
  const jstDay = jstNow.getUTCDay();
  const daysSinceMonday = (jstDay + 6) % 7;
  const startUtcMs = Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
  ) - (daysSinceMonday * 24 * 60 * 60 * 1000) - jstOffsetMs;

  return new Date(startUtcMs).toISOString();
}

function getJstNextWeekStartLabel(now = new Date()): string {
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const weekStart = new Date(getJstWeekStartIso(now));
  const nextWeekStart = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
  const jstNextWeekStart = new Date(nextWeekStart.getTime() + jstOffsetMs);

  return `${jstNextWeekStart.getUTCMonth() + 1}/${jstNextWeekStart.getUTCDate()} 0:00`;
}

function resolveWeeklyLimit(entitlement: UserEntitlementRow | null): number {
  if (typeof entitlement?.ai_weekly_limit === 'number' && entitlement.ai_weekly_limit >= 0) {
    return entitlement.ai_weekly_limit;
  }

  if (entitlement?.plan === 'pro') {
    return PRO_WEEKLY_AI_LIMIT;
  }

  return FREE_WEEKLY_AI_LIMIT;
}

function createAuthorizedSupabaseClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl === undefined || supabaseAnonKey === undefined) {
    throw new Error('Supabase の公開環境変数が不足しています。');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export async function consumeAiUsageLimit(
  request: Request,
  feature: AiFeature,
): Promise<AiUsageLimitResult> {
  const accessToken = getBearerToken(request);

  if (accessToken === null) {
    throw new Error('ログイン状態を確認できません。再ログインしてください。');
  }

  const client = createAuthorizedSupabaseClient(accessToken);
  const { data: userData, error: userError } = await client.auth.getUser(accessToken);

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。再ログインしてください。');
  }

  const { data: entitlement, error: entitlementError } = await client
    .from('user_entitlements')
    .select('plan, ai_weekly_limit, ai_unlimited')
    .eq('user_id', userId)
    .maybeSingle<UserEntitlementRow>();

  if (entitlementError) {
    throw new Error(entitlementError.message);
  }

  if (entitlement?.ai_unlimited === true) {
    return {
      remaining: Number.POSITIVE_INFINITY,
      userId,
    };
  }

  const limit = resolveWeeklyLimit(entitlement ?? null);

  const weekStartIso = getJstWeekStartIso();
  const { count, error: countError } = await client
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', weekStartIso);

  if (countError) {
    throw new Error(countError.message);
  }

  const usedCount = count ?? 0;

  if (usedCount >= limit) {
    const resetLabel = getJstNextWeekStartLabel();
    throw new AiUsageLimitExceededError(`今週のAI使用回数は${limit}回までです。次のリセットは${resetLabel}です。Proなら週20回まで使えます。`);
  }

  const { error: insertError } = await client
    .from('ai_usage_logs')
    .insert({
      user_id: userId,
      feature,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    remaining: limit - usedCount - 1,
    userId,
  };
}
