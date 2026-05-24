type StripeCheckoutSessionParams = {
  customerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
};

type StripePortalSessionParams = {
  customerId: string;
  returnUrl: string;
};

type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

type StripePortalSession = {
  url: string;
};

function getStripeSecretKey(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY が設定されていません。');
  }

  return secretKey;
}

async function requestStripe<T>(path: string, params: URLSearchParams): Promise<T> {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getStripeSecretKey()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  const payload = await response.json() as T & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? 'Stripe API request failed.');
  }

  return payload;
}

export async function createStripeCheckoutSession({
  customerEmail,
  priceId,
  successUrl,
  cancelUrl,
  userId,
}: StripeCheckoutSessionParams): Promise<StripeCheckoutSession> {
  const params = new URLSearchParams();
  params.set('mode', 'subscription');
  params.set('customer_email', customerEmail);
  params.set('line_items[0][price]', priceId);
  params.set('line_items[0][quantity]', '1');
  params.set('success_url', successUrl);
  params.set('cancel_url', cancelUrl);
  params.set('client_reference_id', userId);
  params.set('metadata[user_id]', userId);
  params.set('subscription_data[metadata][user_id]', userId);

  return requestStripe<StripeCheckoutSession>('checkout/sessions', params);
}

export async function createStripePortalSession({
  customerId,
  returnUrl,
}: StripePortalSessionParams): Promise<StripePortalSession> {
  const params = new URLSearchParams();
  params.set('customer', customerId);
  params.set('return_url', returnUrl);

  return requestStripe<StripePortalSession>('billing_portal/sessions', params);
}
