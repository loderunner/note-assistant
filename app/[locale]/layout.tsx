import type { Metadata } from 'next';
import { DM_Sans, Nunito } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { type ReactNode } from 'react';

import { LocalePicker } from './locale-picker';

import { type Locale, isValidLocale, locales } from '@/i18n/config';

import '../globals.css';

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

type LocaleLayoutProps = {
  /** The page content */
  children: ReactNode;
  /** Route parameters containing the locale */
  params: Promise<{ locale: string }>;
};

/**
 * Generate static params for all supported locales.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/**
 * Generate metadata based on the current locale.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : 'en';
  const messages = await getMessages();

  return {
    title: `${messages.metadata.title} | ${messages.metadata.description}`,
    description: messages.metadata.description,
    openGraph: {
      title: messages.metadata.title,
      description: messages.metadata.description,
      type: 'website',
      locale: safeLocale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: messages.metadata.title,
    },
    twitter: {
      card: 'summary_large_image',
      title: messages.metadata.title,
      description: messages.metadata.description,
    },
  };
}

/**
 * Root layout for locale-specific pages.
 * Wraps children with NextIntlClientProvider for client-side translations.
 */
export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${nunito.variable} ${dmSans.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <LocalePicker />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
