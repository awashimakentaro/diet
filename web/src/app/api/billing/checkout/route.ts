import { NextResponse } from 'next/server';

import { createStripeCheckoutSession } from '@/lib/stripe-api';

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get('authorization');
    const token = authorization?.toLowerCase().startsWith('bearer ')
      ? authorization.slice('bearer '.length).trim()
      : null;

    if (!token) {
      return NextResponse.json({ message: 'ログイン状態を確認できません。' }, { status: 401 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    if (!supabaseUrl || !supabaseAnonKey || !priceId) {
      throw new Error('課金用の環境変数が不足しています。');
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user?.email) {
      return NextResponse.json({ message: 'ログイン状態を確認できません。' }, { status: 401 });
    }

    const session = await createStripeCheckoutSession({
      customerEmail: data.user.email,
      priceId,
      userId: data.user.id,
      successUrl: `${appUrl}/app/settings?billing=success`,
      cancelUrl: `${appUrl}/app/settings?billing=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Checkoutの作成に失敗しました。' },
      { status: 500 },
    );
  }
}
