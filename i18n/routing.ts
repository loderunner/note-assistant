import { defineRouting } from 'next-intl/routing';

import { defaultLocale, locales } from './config';

/**
 * Routing configuration for next-intl.
 * Defines supported locales, default locale, and cookie-based locale detection.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
  },
});
