import { processVideo } from '../../regarder/[videoId]/process-video';

import { BulletPointsList } from './bullet-points-list';
import { ReviewActions } from './review-actions';
import { ReviewError } from './review-error';

type ReviewDataProps = {
  /** The YouTube video ID to fetch and display bullet points for */
  videoId: string;
};

/**
 * Server component that fetches bullet points for a video and displays them.
 * Handles errors gracefully by showing an error state with retry option.
 */
export async function ReviewData({ videoId }: ReviewDataProps) {
  try {
    const result = await processVideo(videoId);

    return (
      <>
        <BulletPointsList points={result.points} />
        <ReviewActions videoId={videoId} />
      </>
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Une erreur inattendue s'est produite";

    return <ReviewError message={message} videoId={videoId} />;
  }
}
