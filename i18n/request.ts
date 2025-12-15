import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isValidLocale } from './config';

/**
 * next-intl request configuration for server components.
 * Loads the appropriate message file based on the requested locale.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested !== undefined && isValidLocale(requested)
      ? requested
      : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
