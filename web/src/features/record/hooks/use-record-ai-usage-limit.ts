/* 【責務】
 * Record 画面で食事AI解析の当日利用状況を取得する。
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

import { getSupabaseBrowserClient } from '@/lib/supabase';

type MealAiUsageLimit = {
  isLoading: boolean;
  used: number;
  limit: number;
  isUnlimited: boolean;
  isReached: boolean;
  refresh: () => Promise<void>;
};

const DEFAULT_MEAL_AI_LIMIT = 3;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getJstDayStartIso(now = new Date()): string {
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
  const startUtcMs = Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
  ) - JST_OFFSET_MS;

  return new Date(startUtcMs).toISOString();
}

export function useRecordAiUsageLimit(): MealAiUsageLimit {
  const [isLoading, setIsLoading] = useState(true);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(DEFAULT_MEAL_AI_LIMIT);
  const [isUnlimited, setIsUnlimited] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      setUsed(0);
      setLimit(DEFAULT_MEAL_AI_LIMIT);
      setIsUnlimited(false);
      setIsLoading(false);
      return;
    }

    const [entitlementResult, usageResult] = await Promise.all([
      supabase
        .from('user_entitlements')
        .select('ai_meal_daily_limit, ai_unlimited')
        .eq('user_id', userData.user.id)
        .maybeSingle<{
          ai_meal_daily_limit: number | null;
          ai_unlimited: boolean | null;
        }>(),
      supabase
        .from('ai_usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .eq('feature', 'meal')
        .gte('created_at', getJstDayStartIso()),
    ]);

    if (entitlementResult.error || usageResult.error) {
      setIsLoading(false);
      return;
    }

    const entitlement = entitlementResult.data;
    const nextLimit = typeof entitlement?.ai_meal_daily_limit === 'number'
      ? entitlement.ai_meal_daily_limit
      : DEFAULT_MEAL_AI_LIMIT;

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
