'use client';

import { useTranslations } from 'next-intl';

type ErrorType = 'no_transcript' | 'fetch_failed' | 'generation_failed';

type Props = {
  errorType: ErrorType;
};

const errorKeyMap: Record<ErrorType, string> = {
  no_transcript: 'noTranscript',
  fetch_failed: 'fetchFailed',
  generation_failed: 'generationFailed',
};

/**
 * Error display component for review data.
 * For retryable errors (fetch_failed, generation_failed), throws to trigger
 * the error boundary which provides retry functionality.
 * For non-retryable errors (no_transcript), displays an inline error message.
 */
export function ReviewDataError({ errorType }: Props) {
  const t = useTranslations('review');

  // For retryable errors, throw to trigger error boundary with reset()
  if (errorType === 'fetch_failed' || errorType === 'generation_failed') {
    const errorKey = errorKeyMap[errorType];
    throw new Error(t(`errors.${errorKey}.title`));
  }

  // Non-retryable error (no_transcript) - show inline
  const errorKey = errorKeyMap[errorType];
  return (
    <div className="flex w-full max-w-4xl items-center justify-center py-12">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-4xl">{t(`errors.${errorKey}.emoji`)}</div>
        <p className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t(`errors.${errorKey}.title`)}
        </p>
        <p className="mb-6 max-w-md text-stone-600 dark:text-stone-400">
          {t(`errors.${errorKey}.message`)}
        </p>
      </div>
    </div>
  );
}
