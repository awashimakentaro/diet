import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '../_components/legal-page';
import { legalInfo } from '@/config/legal';

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${legalInfo.serviceName}`,
};

export default function PrivacyPage(): JSX.Element {
  return (
    <LegalPage
      title="プライバシーポリシー"
      lead={`${legalInfo.serviceName} における個人情報等の取り扱いを説明します。`}
    >
      <h2>1. 取得する情報</h2>
      <p>本サービスは、メールアドレス、認証情報、プロフィール情報、体重・目標値、食事記録、トレーニング記録、AI解析に入力されたテキストや画像、課金状態、利用ログ等を取得する場合があります。</p>

      <h2>2. 利用目的</h2>
      <p>取得した情報は、アカウント管理、食事・トレーニング記録機能、AI解析、課金管理、利用状況の確認、不具合調査、サービス改善、問い合わせ対応のために利用します。</p>

      <h2>3. AI解析に関する情報</h2>
      <p>AI解析に入力された内容は、解析結果の生成、エラー調査、品質改善のために利用される場合があります。個人情報や機微な情報の入力は必要最小限にしてください。</p>

      <h2>4. 第三者サービス</h2>
      <p>本サービスでは、認証・データ管理にSupabase、決済にStripe、AI解析にOpenAI等の外部サービスを利用する場合があります。各サービスに送信される情報は、各社の規約・ポリシーに従って取り扱われます。</p>

      <h2>5. 決済情報</h2>
      <p>クレジットカード番号等の決済情報はStripeにより処理され、運営者はカード番号全体を保持しません。</p>

      <h2>6. 安全管理</h2>
      <p>運営者は、取得した情報について、漏えい、滅失、毀損、不正アクセスを防止するため、合理的な安全管理措置を講じます。</p>

      <h2>7. 開示・訂正・削除</h2>
      <p>ユーザー本人から個人情報の開示、訂正、削除等の請求があった場合、法令に従い合理的な範囲で対応します。</p>

      <h2>8. お問い合わせ</h2>
      <p>個人情報の取り扱いに関するお問い合わせは、{legalInfo.contactEmail} までご連絡ください。</p>

      <h2>9. 改定</h2>
      <p>本ポリシーは必要に応じて改定されます。重要な変更がある場合は、適切な方法で通知します。</p>

      <p className="legal-screen__updated">最終更新日: {legalInfo.updatedAt}</p>
    </LegalPage>
  );
}
