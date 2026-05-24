import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';

type AiFeature = 'meal' | 'workout';
type CliAction =
  | 'status'
  | 'reset-ai'
  | 'fill-ai'
  | 'show-onboarding'
  | 'reset-setup'
  | 'ai-unlimited'
  | 'ai-default'
  | 'set-ai-limit';

type AuthUser = {
  id: string;
  email?: string;
  created_at?: string;
};

type UserEntitlementRow = {
  role: string | null;
  ai_meal_daily_limit: number | null;
  ai_workout_daily_limit: number | null;
  ai_unlimited: boolean | null;
};

const DEFAULT_EMAIL = 'TestUser@test.com';
const DEFAULT_LIMIT = 3;
const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

loadEnvConfig(process.cwd());

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);

  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function getAction(): CliAction {
  const action = process.argv[2] as CliAction | undefined;

  if (!action || action.startsWith('--')) {
    return 'status';
  }

  return action;
}

function getFeature(): AiFeature | 'both' {
  const feature = getArg('feature') ?? 'both';

  if (feature !== 'meal' && feature !== 'workout' && feature !== 'both') {
    throw new Error('--feature は meal / workout / both のいずれかを指定してください。');
  }

  return feature;
}

function getLimit(name: string): number {
  const value = getArg(name);
  const parsed = Number(value);

  if (!value || !Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`--${name} は0以上の整数で指定してください。`);
  }

  return parsed;
}

function getOptionalLimit(name: string, fallback: number): number {
  const value = getArg(name);

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`--${name} は0以上の整数で指定してください。`);
  }

  return parsed;
}

function getJstDayStartIso(now = new Date()): string {
  const jstNow = new Date(now.getTime() + JST_OFFSET_MS);
  const startUtcMs = Date.UTC(
    jstNow.getUTCFullYear(),
    jstNow.getUTCMonth(),
    jstNow.getUTCDate(),
  ) - JST_OFFSET_MS;

  return new Date(startUtcMs).toISOString();
}

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL が .env にありません。');
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY が .env にありません。Supabase Project Settings > API から service_role key を追加してください。');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function findUserByEmail(client: ReturnType<typeof createAdminClient>, email: string): Promise<AuthUser> {
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

    if (user?.id) {
      return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      };
    }

    if (data.users.length < 1000) {
      break;
    }

    page += 1;
  }

  throw new Error(`${email} のユーザーが見つかりません。先にログイン/登録してください。`);
}

async function deleteTodayAiUsage(
  client: ReturnType<typeof createAdminClient>,
  userId: string,
  feature: AiFeature | 'both',
) {
  let query = client
    .from('ai_usage_logs')
    .delete()
    .eq('user_id', userId)
    .gte('created_at', getJstDayStartIso());

  if (feature !== 'both') {
    query = query.eq('feature', feature);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

async function fillTodayAiUsage(
  client: ReturnType<typeof createAdminClient>,
  userId: string,
  feature: AiFeature | 'both',
  limit: number,
) {
  await deleteTodayAiUsage(client, userId, feature);

  const features: AiFeature[] = feature === 'both' ? ['meal', 'workout'] : [feature];
  const rows = features.flatMap((item) => Array.from({ length: limit }, (_, index) => ({
    user_id: userId,
    feature: item,
    created_at: new Date(Date.now() - (index + 1) * 60 * 1000).toISOString(),
  })));

  if (rows.length === 0) {
    return;
  }

  const { error } = await client.from('ai_usage_logs').insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

async function getUsageCount(
  client: ReturnType<typeof createAdminClient>,
  userId: string,
  feature: AiFeature,
): Promise<number> {
  const { count, error } = await client
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', getJstDayStartIso());

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function getEntitlement(
  client: ReturnType<typeof createAdminClient>,
  userId: string,
): Promise<UserEntitlementRow | null> {
  const { data, error } = await client
    .from('user_entitlements')
    .select('role, ai_meal_daily_limit, ai_workout_daily_limit, ai_unlimited')
    .eq('user_id', userId)
    .maybeSingle<UserEntitlementRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function printStatus(client: ReturnType<typeof createAdminClient>, user: AuthUser) {
  const [mealCount, workoutCount, entitlement] = await Promise.all([
    getUsageCount(client, user.id, 'meal'),
    getUsageCount(client, user.id, 'workout'),
    getEntitlement(client, user.id),
  ]);

  const { count: profileCount, error: profileError } = await client
    .from('user_profiles')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (profileError) {
    throw new Error(profileError.message);
  }

  console.log(`user: ${user.email ?? '(no email)'}`);
  console.log(`id: ${user.id}`);
  console.log(`created_at: ${user.created_at ?? '-'}`);
  console.log(`onboarding: ${(profileCount ?? 0) > 0 ? 'completed' : 'will show'}`);
  console.log(`ai meal usage today: ${mealCount}`);
  console.log(`ai workout usage today: ${workoutCount}`);
  console.log(`entitlement: ${JSON.stringify(entitlement ?? 'default', null, 2)}`);
}

async function showOnboarding(client: ReturnType<typeof createAdminClient>, userId: string) {
  const { error } = await client
    .from('user_profiles')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function resetSetup(client: ReturnType<typeof createAdminClient>, userId: string) {
  const { error: goalsError } = await client
    .from('goals')
    .delete()
    .eq('user_id', userId);

  if (goalsError) {
    throw new Error(goalsError.message);
  }

  await showOnboarding(client, userId);
}

async function setAiUnlimited(client: ReturnType<typeof createAdminClient>, userId: string) {
  const { error } = await client
    .from('user_entitlements')
    .upsert({
      user_id: userId,
      role: 'tester',
      ai_unlimited: true,
      ai_meal_daily_limit: null,
      ai_workout_daily_limit: null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }
}

async function setAiDefault(client: ReturnType<typeof createAdminClient>, userId: string) {
  const { error } = await client
    .from('user_entitlements')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

async function setAiLimit(client: ReturnType<typeof createAdminClient>, userId: string) {
  const mealLimit = getLimit('meal');
  const workoutLimit = getLimit('workout');

  const { error } = await client
    .from('user_entitlements')
    .upsert({
      user_id: userId,
      role: 'tester',
      ai_unlimited: false,
      ai_meal_daily_limit: mealLimit,
      ai_workout_daily_limit: workoutLimit,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }
}

async function main() {
  const action = getAction();
  const email = getArg('email') ?? DEFAULT_EMAIL;
  const client = createAdminClient();
  const user = await findUserByEmail(client, email);

  switch (action) {
    case 'status':
      await printStatus(client, user);
      return;

    case 'reset-ai':
      await deleteTodayAiUsage(client, user.id, getFeature());
      console.log(`reset today's AI usage: ${email}`);
      return;

    case 'fill-ai':
      await fillTodayAiUsage(client, user.id, getFeature(), getOptionalLimit('limit', DEFAULT_LIMIT));
      console.log(`filled today's AI usage: ${email}`);
      return;

    case 'show-onboarding':
      await showOnboarding(client, user.id);
      console.log(`onboarding will show on next app access: ${email}`);
      return;

    case 'reset-setup':
      await resetSetup(client, user.id);
      console.log(`profile/goals reset: ${email}`);
      return;

    case 'ai-unlimited':
      await setAiUnlimited(client, user.id);
      console.log(`AI unlimited enabled: ${email}`);
      return;

    case 'ai-default':
      await setAiDefault(client, user.id);
      console.log(`AI limits returned to default: ${email}`);
      return;

    case 'set-ai-limit':
      await setAiLimit(client, user.id);
      console.log(`custom AI limits updated: ${email}`);
      return;

    default:
      if (hasFlag('help')) {
        return;
      }

      throw new Error(`unknown action: ${action}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
