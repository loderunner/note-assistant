import { generateBulletPoints } from '@/app/summary/generate';
import type { Locale } from '@/i18n/config';
import { getVideoTranscript } from '@/youtube/video-info';

type ReviewDataResult =
  | { success: true; points: string[] }
  | {
      success: false;
      errorType: 'no_transcript' | 'fetch_failed' | 'generation_failed';
    };

/**
 * Fetches transcript and generates bullet points for a video on the server.
 * This function is called from server components and can be passed as a promise
 * to client components for Suspense streaming.
 *
 * @param videoId - The YouTube video ID
 * @param locale - The user's locale for prompt language
 * @returns A promise that resolves to review data or an error
 *
 * @example
 * ```ts
 * const promise = fetchReviewData('dQw4w9WgXcQ', 'en');
 * // Pass promise to client component wrapped in Suspense
 * ```
 */
export async function fetchReviewData(
  videoId: string,
  locale: Locale,
): Promise<ReviewDataResult> {
  const transcriptResult = await getVideoTranscript(videoId);

  if (!transcriptResult.success) {
    return { success: false, errorType: transcriptResult.errorType };
  }

  const { transcript } = transcriptResult;
  const result = await generateBulletPoints(
    transcript.fullText,
    videoId,
    transcript.duration,
    locale,
  );

  return { success: true, points: result.points };
}
