import { processVideo } from '../../regarder/[videoId]/process-video';

import { BulletPointsList } from './bullet-points-list';
import { ReviewActions } from './review-actions';

type ReviewDataProps = {
  /** The YouTube video ID to fetch and display bullet points for */
  videoId: string;
};

/**
 * Server component that fetches bullet points for a video and displays them.
 * Errors are caught by the error.tsx boundary in this route segment.
 */
export async function ReviewData({ videoId }: ReviewDataProps) {
  const result = await processVideo(videoId);

  return (
    <>
      <BulletPointsList points={result.points} />
      <ReviewActions videoId={videoId} />
    </>
  );
}
