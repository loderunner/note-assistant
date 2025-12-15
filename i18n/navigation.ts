import { createNavigation } from 'next-intl/navigation';

import { routing } from './routing';

/**
 * Locale-aware navigation utilities.
 * Use these instead of Next.js's default navigation components.
 */
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
