import { createClient } from '@supabase/supabase-js';

type AiFeature = 'meal' | 'workout';

type AiUsageLimitResult = {
  remaining: number;
  userId: string;
};

type UserEntitlementRow = {
  ai_meal_daily_limit: number | null;
  ai_workout_daily_limit: number | null;
  ai_unlimited: boolean | null;
};

export class AiUsageLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiUsageLimitExceededError';
  }
}

const AI_FEATURE_LIMITS: Record<AiFeature, number> = {
  meal: 3,
  workout: 3,
};

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get('authorization');

  if (authorization === null || !authorization.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  return authorization.slice('bearer '.length).trim();
}

function getJstDayStartIso(now = new Date()): string {
  const jstOffsetMs = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffsetMs);
  const startUtcMs = Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
  ) - jstOffsetMs;

  return new Date(startUtcMs).toISOString();
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
    .select('ai_meal_daily_limit, ai_workout_daily_limit, ai_unlimited')
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

  const customLimit = feature === 'meal'
    ? entitlement?.ai_meal_daily_limit
    : entitlement?.ai_workout_daily_limit;
  const limit = typeof customLimit === 'number' && customLimit >= 0
    ? customLimit
    : AI_FEATURE_LIMITS[feature];

  const dayStartIso = getJstDayStartIso();
  const { count, error: countError } = await client
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', dayStartIso);

  if (countError) {
    throw new Error(countError.message);
  }

  const usedCount = count ?? 0;

  if (usedCount >= limit) {
    const featureLabel = feature === 'meal' ? '食事AI解析' : '筋トレAI推定';
    throw new AiUsageLimitExceededError(`${featureLabel}は1日${limit}回までです。明日またお試しください。`);
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
