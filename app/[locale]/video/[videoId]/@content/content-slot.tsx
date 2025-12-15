'use client';

import { useTranslations } from 'next-intl';

import { useVideoPlayer } from '../video-player-context';

/**
 * Content slot for the video watch page.
 * Shows instructions and skip-to-end button.
 */
export function ContentSlot() {
  const t = useTranslations('video');
  const { skipToEnd, playerReady } = useVideoPlayer();

  return (
    <div className="flex translate-y-0 flex-col items-center gap-3 opacity-100 transition-all delay-300 duration-300">
      <p className="text-center text-lg text-stone-700 dark:text-stone-200">
        {t('watchAndTakeNotes')}
      </p>
      {playerReady && skipToEnd !== null && (
        <button
          aria-label={t('skipToEnd')}
          className="rounded-full bg-amber-100 px-4 py-2 text-sm text-stone-700 transition-all hover:scale-105 hover:bg-amber-200 active:scale-95 dark:bg-slate-800 dark:text-stone-300 dark:hover:bg-slate-700"
          type="button"
          onClick={skipToEnd}
        >
          {t('skipToEnd')}
        </button>
      )}
    </div>
  );
}
