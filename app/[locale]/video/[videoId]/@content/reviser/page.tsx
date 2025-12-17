import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { fetchReviewData } from './fetch-review-data';
import { ReviewContent } from './review-content';
import { ReviewDataClient } from './review-data-client';
import { ReviewDataLoading } from './review-data-loading';

import { type Locale, isValidLocale } from '@/i18n/config';
import { getVideoTitle } from '@/youtube/video-info';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

/**
 * Generate metadata for the review page.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const [{ videoId }, t] = await Promise.all([
    params,
    getTranslations('video'),
  ]);
  const videoTitle = await getVideoTitle(videoId);
  const reviewTitle = t('reviewTitle');

  const title =
    videoTitle !== null ? `Notix | ${reviewTitle}: ${videoTitle}` : 'Notix';

  return {
    title,
  };
}

/**
 * Review page for comparing notes with generated key points.
 * Fetches transcript and generates bullet points on the server,
 * streaming results to the client via Suspense.
 */
export default async function ReviewPage({ params }: PageProps) {
  const [{ videoId }, t, rawLocale] = await Promise.all([
    params,
    getTranslations('review'),
    getLocale(),
  ]);

  const locale: Locale = isValidLocale(rawLocale) ? rawLocale : 'en';

  // Start fetch immediately - don't await
  const reviewDataPromise = fetchReviewData(videoId, locale);

  return (
    <>
      <p className="mb-8 translate-y-0 text-center text-lg text-stone-700 opacity-100 transition-all delay-200 duration-300 dark:text-stone-200 starting:translate-y-5 starting:opacity-0">
        {t('instruction')}
      </p>
      <ReviewContent>
        <Suspense fallback={<ReviewDataLoading />}>
          <ReviewDataClient reviewDataPromise={reviewDataPromise} />
        </Suspense>
      </ReviewContent>
    </>
  );
}
