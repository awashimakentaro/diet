/* 【責務】
 * Workouts 画面で筋トレAI推定の当日利用状況を取得する。
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase';

type WorkoutAiUsageLimit = {
  isLoading: boolean;
  used: number;
  limit: number;
  isUnlimited: boolean;
  isReached: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_FREE_WEEKLY_AI_LIMIT = 5;
const DEFAULT_PRO_WEEKLY_AI_LIMIT = 20;
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

export function useWorkoutAiUsageLimit(): WorkoutAiUsageLimit {
  const [isLoading, setIsLoading] = useState(true);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_FREE_WEEKLY_AI_LIMIT);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setUsed(0);
      setLimit(DEFAULT_FREE_WEEKLY_AI_LIMIT);
      setIsUnlimited(false);
      setIsLoading(false);
      return;
    }

    const [entitlementResult, usageResult] = await Promise.all([
      supabase
        .from('user_entitlements')
        .select('plan, ai_weekly_limit, ai_unlimited')
        .eq('user_id', userData.user.id)
        .maybeSingle<{
          plan: string | null;
          ai_weekly_limit: number | null;
          ai_unlimited: boolean | null;
        }>(),
      supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .gte('created_at', getJstWeekStartIso()),
    ]);

    if (entitlementResult.error || usageResult.error) {
      setIsLoading(false);
      return;
    }

    const entitlement = entitlementResult.data;
    const nextLimit = typeof entitlement?.ai_weekly_limit === 'number'
      ? entitlement.ai_weekly_limit
      : entitlement?.plan === 'pro'
        ? DEFAULT_PRO_WEEKLY_AI_LIMIT
        : DEFAULT_FREE_WEEKLY_AI_LIMIT;

    setUsed(usageResult.count ?? 0);
    setLimit(nextLimit);
    setIsUnlimited(entitlement?.ai_unlimited === true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  return {
    isLoading,
    used,
    limit,
    isUnlimited,
    isReached: !isUnlimited && used >= limit,
    refresh,
  };
}
