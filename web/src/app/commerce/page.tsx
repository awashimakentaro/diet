import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '../_components/legal-page';
import { legalInfo } from '@/config/legal';

export const metadata: Metadata = {
  title: `特定商取引法に基づく表記 | ${legalInfo.serviceName}`,
};

const rows = [
  ['販売事業者', legalInfo.operatorName],
  ['所在地', legalInfo.operatorAddress],
  ['お問い合わせ先', legalInfo.contactEmail],
  ['販売価格', legalInfo.priceDescription],
  ['商品代金以外の必要料金', 'インターネット接続料金、通信料金等はユーザーの負担となります。'],
  ['支払方法', 'クレジットカード決済（Stripe）'],
  ['支払時期', '初回申込時および以後の更新日に決済されます。'],
  ['サービス提供時期', '決済完了後、ただちに有料機能を利用できます。'],
  ['返品・キャンセル', 'デジタルサービスの性質上、購入後の返金には原則として応じません。ただし法令上必要な場合を除きます。'],
  ['解約', 'アプリ内の課金管理画面からいつでも解約できます。'],
  ['動作環境', '最新版の主要ブラウザでの利用を推奨します。'],
] as const;

export default function CommercePage(): JSX.Element {
  return (
    <LegalPage
      title="特定商取引法に基づく表記"
      lead="有料プランの販売条件を表示します。"
    >
      <div className="legal-screen__table">
        {rows.map(([label, value]) => (
          <div className="legal-screen__row" key={label}>
            <strong>{label}</strong>
            <span>{value}</span>
          </div>
        ))}
      </div>
      <p className="legal-screen__note">
        所在地・電話番号については、個人運営の場合、請求があった場合に遅滞なく開示する形式を採用できます。公開前に運用方針と法務確認を行ってください。
      </p>
      <p className="legal-screen__updated">最終更新日: {legalInfo.updatedAt}</p>
    </LegalPage>
  );
}
