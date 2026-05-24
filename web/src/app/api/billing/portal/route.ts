import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

import { createStripePortalSession } from '@/lib/stripe-api';

type EntitlementRow = {
  stripe_customer_id: string | null;
};

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.toLowerCase().startsWith('bearer ')
      ? authorization.slice('bearer '.length).trim()
      : null;

    if (!token) {
      return NextResponse.json({ message: 'ログイン状態を確認できません。' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase の公開環境変数が不足しています。');
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ message: 'ログイン状態を確認できません。' }, { status: 401 });
    }

    const { data: entitlement, error: entitlementError } = await client
      .from('user_entitlements')
      .select('stripe_customer_id')
      .eq('user_id', data.user.id)
      .maybeSingle<EntitlementRow>();

    if (entitlementError) {
      throw new Error(entitlementError.message);
    }

    if (!entitlement?.stripe_customer_id) {
      return NextResponse.json({ message: '課金情報がまだありません。' }, { status: 404 });
    }

    const session = await createStripePortalSession({
      customerId: entitlement.stripe_customer_id,
      returnUrl: `${appUrl}/app/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Customer Portalの作成に失敗しました。' },
      { status: 500 },
    );
  }
}
