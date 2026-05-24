import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type StripeEvent = {
  type: string;
  data: {
    object: Record<string, unknown>;
  };
};

function verifyStripeSignature(payload: string, signatureHeader: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return expectedBuffer.length === signatureBuffer.length && timingSafeEqual(expectedBuffer, signatureBuffer);
}

function getString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function getPeriodEnd(value: unknown): string | null {
  return typeof value === 'number' ? new Date(value * 1000).toISOString() : null;
}

function getBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

async function upsertProEntitlement(params: {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}) {
  const admin = createSupabaseAdminClient();
  const isActive = params.status === 'active' || params.status === 'trialing';

  const { error } = await admin
    .from('user_entitlements')
    .upsert({
      user_id: params.userId,
      role: isActive ? 'subscriber' : 'user',
      plan: isActive ? 'pro' : 'free',
      ai_weekly_limit: isActive ? 20 : 5,
      ai_unlimited: false,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      subscription_status: params.status,
      cancel_at_period_end: isActive ? params.cancelAtPeriodEnd : false,
      current_period_end: params.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const payload = await request.text();

  if (!verifyStripeSignature(payload, request.headers.get('stripe-signature'))) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  const object = event.data.object;

  try {
    if (event.type === 'checkout.session.completed') {
      const userId = getString((object.metadata as Record<string, unknown> | undefined)?.user_id)
        ?? getString(object.client_reference_id);

      if (userId) {
        await upsertProEntitlement({
          userId,
          customerId: getString(object.customer),
          subscriptionId: getString(object.subscription),
          status: 'active',
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const userId = getString((object.metadata as Record<string, unknown> | undefined)?.user_id);

      if (userId) {
        await upsertProEntitlement({
          userId,
          customerId: getString(object.customer),
          subscriptionId: getString(object.id),
          status: getString(object.status),
          cancelAtPeriodEnd: getBoolean(object.cancel_at_period_end),
          currentPeriodEnd: getPeriodEnd(object.current_period_end),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Webhook処理に失敗しました。' },
      { status: 500 },
    );
  }
}
