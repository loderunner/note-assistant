'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

/**
 * Action buttons displayed after reviewing bullet points.
 * Provides options to re-watch the video or start with a new one.
 */
export function ReviewActions() {
  const t = useTranslations('review');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 flex gap-4">
      <button
        className="rounded-full bg-linear-to-r from-rose-500 to-rose-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-rose-600 hover:to-rose-700 hover:shadow-xl active:scale-95"
        onClick={scrollToTop}
      >
        {t('rewatch')}
      </button>
      <Link
        className="rounded-full border-2 border-stone-300 bg-amber-50 px-8 py-3 font-semibold text-stone-700 shadow-md transition-all hover:scale-105 hover:bg-amber-100 hover:shadow-lg active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-stone-200 dark:hover:bg-slate-700"
        href="/"
      >
        {t('newVideo')}
      </Link>
    </div>
  );
}
