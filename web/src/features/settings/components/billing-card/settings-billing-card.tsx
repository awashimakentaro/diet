'use client';

import { CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { JSX } from 'react';
import useSWR from 'swr';

import { paths } from '@/config/paths';
import { getBillingEntitlement } from '../../api/get-billing-entitlement';
import { startBillingCheckout } from '../../api/start-billing-checkout';
import { startBillingPortal } from '../../api/start-billing-portal';

export function SettingsBillingCard(): JSX.Element {
  const { data, isLoading, error } = useSWR('/settings/billing-entitlement', getBillingEntitlement);
  const isPro = data?.plan === 'pro';
  const weeklyLimit = data?.aiWeeklyLimit ?? 5;
  const weeklyUsed = data?.aiWeeklyUsed ?? 0;
  const weeklyRemaining = Math.max(weeklyLimit - weeklyUsed, 0);
  const usagePercent = data?.aiUnlimited ? 100 : Math.min((weeklyUsed / weeklyLimit) * 100, 100);
  const usageTone = data?.aiUnlimited
    ? 'unlimited'
    : usagePercent >= 100
      ? 'full'
      : usagePercent >= 80
        ? 'warning'
        : 'normal';
  const isCancelScheduled = Boolean(data?.cancelAtPeriodEnd && data.currentPeriodEnd);
  const periodEndLabel = data?.currentPeriodEnd
    ? new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Tokyo',
    }).format(new Date(data.currentPeriodEnd))
    : null;

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

        <div className="settings-screen__usage-meter" data-tone={usageTone}>
          <div className="settings-screen__usage-meter-head">
            <span>今週のAI使用回数</span>
            <strong>
              {isLoading
                ? '確認中...'
                : data?.aiUnlimited
                  ? `${weeklyUsed} 回 / 無制限`
                  : `${weeklyUsed} / ${weeklyLimit} 回`}
            </strong>
          </div>
          <div className="settings-screen__usage-track" aria-hidden="true">
            <div className="settings-screen__usage-fill" style={{ width: `${usagePercent}%` }} />
          </div>
          <p>
            {data?.aiUnlimited
              ? 'テスト権限により上限なしで利用できます。'
              : weeklyRemaining > 0
                ? `今週あと ${weeklyRemaining} 回使えます。毎週月曜0:00に復活します。`
                : '今週のAI利用回数を使い切りました。毎週月曜0:00に復活します。'}
          </p>
        </div>

        <p className="settings-screen__billing-copy">
          Freeは食事AIと筋トレAIを合わせて週5回まで。Proは週20回まで使えます。
        </p>

        {isCancelScheduled ? (
          <p className="settings-screen__billing-status" data-tone="warning">
            解約予約済みです。{periodEndLabel} まではProのAI上限を利用できます。
          </p>
        ) : null}

        {data?.subscriptionStatus && !isCancelScheduled && data.subscriptionStatus !== 'active' ? (
          <p className="settings-screen__billing-status" data-tone="danger">
            課金ステータス: {data.subscriptionStatus}
          </p>
        ) : null}

        <div className="settings-screen__billing-links">
          <Link href={paths.legal.terms.getHref()}>利用規約</Link>
          <Link href={paths.legal.privacy.getHref()}>プライバシー</Link>
          <Link href={paths.legal.commerce.getHref()}>特商法表記</Link>
        </div>

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
