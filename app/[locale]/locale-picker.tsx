'use client';

import { useLocale } from 'next-intl';

import { type Locale, locales } from '@/i18n/config';
import { Link, usePathname } from '@/i18n/navigation';

const localeLabels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
};

const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

/**
 * A discreet locale picker that allows users to switch between languages.
 * Uses next-intl's Link component with the locale prop, which triggers
 * the proxy middleware to set the NEXT_LOCALE cookie automatically.
 */
export function LocalePicker() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-1 rounded-full bg-white/80 p-1 shadow-sm backdrop-blur-sm dark:bg-slate-800/80">
      {locales.map((loc) => (
        <Link
          key={loc}
          aria-current={locale === loc ? 'page' : undefined}
          aria-label={`Switch to ${localeNames[loc]}`}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            locale === loc
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-slate-700'
          }`}
          href={pathname}
          locale={loc}
        >
          {localeLabels[loc]}
        </Link>
      ))}
    </div>
  );
}
