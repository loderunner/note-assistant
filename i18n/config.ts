/**
 * Supported locales for the application.
 *
 * @example
 * ```ts
 * import { locales, defaultLocale } from '@/i18n/config';
 * console.log(locales); // ['en', 'fr']
 * console.log(defaultLocale); // 'en'
 * ```
 */
export const locales = ['en', 'fr'] as const;

/**
 * The default locale used when the user's preferred locale is not supported.
 */
export const defaultLocale = 'en' as const;

/**
 * A supported locale type.
 */
export type Locale = (typeof locales)[number];

/**
 * Check if a string is a valid locale.
 *
 * @param value - The string to check
 * @returns Whether the string is a valid locale
 *
 * @example
 * ```ts
 * isValidLocale('en') // true
 * isValidLocale('de') // false
 * ```
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
