import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

/**
 * Proxy that handles locale detection and routing.
 * - Detects locale from NEXT_LOCALE cookie or Accept-Language header
 * - Redirects to locale-prefixed routes when needed
 * - Sets the NEXT_LOCALE cookie for persistence
 */
export const proxy = createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - static files (images, fonts, etc.)
    // - robots.txt (handled by Next.js metadata convention)
    '/((?!api|_next|robots\\.txt|.*\\..*).*)',
  ],
};
