import type { Metadata } from 'next';
import { DM_Sans, Nunito } from 'next/font/google';
import { type ReactNode } from 'react';

import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Notix',
  description: 'Entraîne-toi à la prise de notes',
  openGraph: {
    title: 'Notix',
    description: 'Entraîne-toi à la prise de notes',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Notix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notix',
    description: 'Entraîne-toi à la prise de notes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${nunito.variable} ${dmSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
