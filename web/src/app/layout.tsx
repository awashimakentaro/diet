import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';
import { AuthProvider } from '@/app/provider';
import '@/styles/globals.css';


export const metadata: Metadata = {
  title: 'Diet Web',
  description: 'Die Web',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
