import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import type { JSX, ReactNode } from 'react';

import { paths } from '@/config/paths';

type LegalPageProps = {
  title: string;
  lead: string;
  children: ReactNode;
};

export function LegalPage({ title, lead, children }: LegalPageProps): JSX.Element {
  return (
    <main className="legal-screen">
      <header className="legal-screen__topbar">
        <Link className="landing-screen__brand" href={paths.home.getHref()}>
          <span className="landing-screen__brand-icon">
            <Dumbbell aria-hidden="true" size={18} strokeWidth={2.5} />
          </span>
          <span className="landing-screen__brand-mark">PFC TRACKER</span>
        </Link>
      </header>

      <section className="legal-screen__hero">
        <p className="legal-screen__eyebrow">LEGAL</p>
        <h1>{title}</h1>
        <p>{lead}</p>
      </section>

      <section className="legal-screen__body">
        {children}
      </section>

      <footer className="legal-screen__footer">
        <Link href={paths.legal.terms.getHref()}>利用規約</Link>
        <Link href={paths.legal.privacy.getHref()}>プライバシーポリシー</Link>
        <Link href={paths.legal.commerce.getHref()}>特定商取引法に基づく表記</Link>
        <Link href={paths.legal.contact.getHref()}>お問い合わせ</Link>
      </footer>
    </main>
  );
}
