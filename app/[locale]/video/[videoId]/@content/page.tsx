import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ContentSlot } from './content-slot';

import { getVideoTitle } from '@/youtube/video-info';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

/**
 * Generate metadata for the watch page.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { videoId } = await params;
  const t = await getTranslations('video');
  const videoTitle = await getVideoTitle(videoId);
  const watchTitle = t('watchTitle');

  const title =
    videoTitle !== null ? `Notix | ${watchTitle}: ${videoTitle}` : 'Notix';

  return {
    title,
  };
}

/**
 * Watch page for viewing a video and taking notes.
 */
export default async function WatchPage() {
  return <ContentSlot />;
}
