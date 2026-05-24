import { Mail } from 'lucide-react';
import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '../_components/legal-page';
import { legalInfo } from '@/config/legal';

export const metadata: Metadata = {
  title: `お問い合わせ | ${legalInfo.serviceName}`,
};

export default function ContactPage(): JSX.Element {
  return (
    <LegalPage
      title="お問い合わせ"
      lead="不具合、課金、アカウント、個人情報に関する問い合わせ先です。"
    >
      <div className="legal-screen__contact-card">
        <Mail size={22} strokeWidth={2.2} />
        <div>
          <h2>メールで問い合わせる</h2>
          <p>{legalInfo.contactEmail}</p>
          <a href={`mailto:${legalInfo.contactEmail}`}>メールアプリを開く</a>
        </div>
      </div>

      <h2>問い合わせ時に含めてほしい情報</h2>
      <p>ログインメールアドレス、発生した画面、発生日時、操作内容、表示されたエラー文言を記載してください。課金に関する問い合わせでは、カード番号を送らないでください。</p>
    </LegalPage>
  );
}
