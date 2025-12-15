import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ReviewContent } from './review-content';
import { ReviewData } from './review-data';

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
  const { videoId } = await params;
  const t = await getTranslations('video');
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
 */
export default async function ReviewPage({ params }: PageProps) {
  const { videoId } = await params;
  const t = await getTranslations('review');

  return (
    <>
      <p className="mb-8 translate-y-0 text-center text-lg text-stone-700 opacity-100 transition-all delay-200 duration-300 dark:text-stone-200 starting:translate-y-5 starting:opacity-0">
        {t('instruction')}
      </p>
      <ReviewContent>
        <ReviewData videoId={videoId} />
      </ReviewContent>
    </>
  );
}
