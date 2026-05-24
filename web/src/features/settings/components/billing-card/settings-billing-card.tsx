'use client';

import { CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import type { JSX } from 'react';
import useSWR from 'swr';

import { getBillingEntitlement } from '../../api/get-billing-entitlement';
import { startBillingCheckout } from '../../api/start-billing-checkout';
import { startBillingPortal } from '../../api/start-billing-portal';

export function SettingsBillingCard(): JSX.Element {
  const { data, isLoading, error } = useSWR('/settings/billing-entitlement', getBillingEntitlement);
  const isPro = data?.plan === 'pro';

  async function handleCheckout(): Promise<void> {
    const url = await startBillingCheckout();
    window.location.assign(url);
  }

  async function handlePortal(): Promise<void> {
    const url = await startBillingPortal();
    window.location.assign(url);
  }

  return (
    <section className="settings-screen__section">
      <p className="eyebrow">課金プラン</p>

      <div className="settings-screen__card settings-screen__billing-card app-card">
        <div className="settings-screen__billing-head">
          <div className="settings-screen__account-avatar">
            <Sparkles size={18} strokeWidth={2.1} />
          </div>
          <div className="settings-screen__account-copy">
            <span>{isPro ? 'PRO PLAN' : data?.aiUnlimited ? 'TESTER' : 'FREE PLAN'}</span>
            <strong>{isPro ? 'Pro' : data?.aiUnlimited ? 'Free + unlimited test' : 'Free'}</strong>
          </div>
        </div>

        <div className="settings-screen__billing-meter">
          <span>AI利用上限</span>
          <strong>
            {isLoading ? '確認中...' : data?.aiUnlimited ? '無制限' : `${data?.aiWeeklyLimit ?? 5} 回 / 週`}
          </strong>
        </div>

        <p className="settings-screen__billing-copy">
          Freeは食事AIと筋トレAIを合わせて週5回まで。Proは週20回まで使えます。
        </p>

        {error ? (
          <p className="settings-screen__feedback settings-screen__feedback--error">
            課金状態を確認できませんでした。
          </p>
        ) : null}

        {isPro ? (
          <button className="settings-screen__account-button" onClick={() => { void handlePortal(); }} type="button">
            <CreditCard size={16} strokeWidth={2.2} />
            <span>課金管理を開く</span>
            <ExternalLink size={15} strokeWidth={2.1} />
          </button>
        ) : (
          <button className="settings-screen__primary-button" onClick={() => { void handleCheckout(); }} type="button">
            <Sparkles size={16} strokeWidth={2.2} />
            <span>Proにアップグレード</span>
          </button>
        )}
      </div>
    </section>
  );
}
