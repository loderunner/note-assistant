'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

/**
 * Error boundary for the video review page.
 * Catches rendering errors and provides retry functionality.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  return (
    <div className="flex w-full max-w-md translate-y-0 flex-col items-center gap-6 text-center opacity-100 transition-all duration-300 starting:translate-y-5 starting:opacity-0">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
        <span className="text-4xl">😅</span>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">
          {t('oops')}
        </h2>
        <p className="text-stone-600 dark:text-stone-400">{error.message}</p>
      </div>

      <div className="flex gap-4">
        <button
          className="rounded-full bg-linear-to-r from-rose-500 to-rose-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-rose-600 hover:to-rose-700 hover:shadow-xl active:scale-95"
          onClick={reset}
        >
          {t('retry')}
        </button>
        <Link
          className="rounded-full border-2 border-stone-300 bg-amber-50 px-8 py-3 font-semibold text-stone-700 shadow-md transition-all hover:scale-105 hover:bg-amber-100 hover:shadow-lg active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-stone-200 dark:hover:bg-slate-700"
          href="/"
        >
          {t('newVideo')}
        </Link>
      </div>
    </div>
  );
}
