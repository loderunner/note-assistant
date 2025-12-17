'use client';

import { useTranslations } from 'next-intl';

/**
 * Loading state component displayed while review data is being fetched.
 * Shows animated loading dots and a loading message.
 */
export function ReviewDataLoading() {
  const t = useTranslations('review');
  return (
    <div className="flex w-full max-w-4xl items-center justify-center py-12">
      <div className="text-center">
        <div className="mb-4 flex justify-center gap-2">
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-rose-500"
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-rose-500"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-3 w-3 animate-bounce rounded-full bg-rose-500 delay-300"
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <p className="text-stone-600 dark:text-stone-300">
          {t('loading.generating')}
        </p>
      </div>
    </div>
  );
}
