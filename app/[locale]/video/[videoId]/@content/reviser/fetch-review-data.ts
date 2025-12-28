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
 * In-memory cache for pending fetch promises.
 * Keyed by `${videoId}-${locale}` to deduplicate concurrent requests.
 */
const pendingFetches = new Map<string, Promise<ReviewDataResult>>();

/**
 * Internal function that performs the actual data fetching.
 * Wrapped by fetchReviewData to enable promise caching.
 */
async function fetchReviewDataInternal(
  videoId: string,
  locale: Locale,
): Promise<ReviewDataResult> {
  console.debug(
    `fetchReviewDataInternal: starting for video=${videoId} locale=${locale}`,
  );

  const transcriptResult = await getVideoTranscript(videoId);

  if (!transcriptResult.success) {
    console.info(
      `fetchReviewDataInternal: transcript fetch failed for video=${videoId} errorType=${transcriptResult.errorType}`,
    );
    return { success: false, errorType: transcriptResult.errorType };
  }

  const { transcript } = transcriptResult;
  console.debug(
    `fetchReviewDataInternal: got transcript for video=${videoId}, generating bullet points`,
  );

  const result = await generateBulletPoints(
    transcript.fullText,
    videoId,
    transcript.duration,
    locale,
  );

  console.info(
    `fetchReviewDataInternal: success for video=${videoId} points=${result.points.length}`,
  );
  return { success: true, points: result.points };
}

/**
 * Fetches transcript and generates bullet points for a video on the server.
 * This function is called from server components and can be passed as a promise
 * to client components for Suspense streaming.
 *
 * Concurrent calls with the same videoId and locale will return the same promise,
 * preventing duplicate API calls.
 *
 * Can be called without awaiting to prefetch data in the background. The fetch
 * will populate the blob cache, and subsequent calls (even from different
 * serverless instances) can benefit from cached results.
 *
 * @param videoId - The YouTube video ID
 * @param locale - The user's locale for prompt language
 * @returns A promise that resolves to review data or an error
 *
 * @example
 * ```ts
 * // Await for immediate use
 * const promise = fetchReviewData('dQw4w9WgXcQ', 'en');
 * // Pass promise to client component wrapped in Suspense
 *
 * // Or call without awaiting to prefetch
 * fetchReviewData('dQw4w9WgXcQ', 'en');
 * // Fetch starts in background, doesn't block rendering
 * ```
 */
export async function fetchReviewData(
  videoId: string,
  locale: Locale,
): Promise<ReviewDataResult> {
  const cacheKey = `${videoId}-${locale}`;

  const existingPromise = pendingFetches.get(cacheKey);
  if (existingPromise !== undefined) {
    console.debug(
      `fetchReviewData: reusing pending promise for cacheKey=${cacheKey}`,
    );
    return existingPromise;
  }

  console.debug(
    `fetchReviewData: starting new fetch for video=${videoId} locale=${locale}`,
  );

  const promise = fetchReviewDataInternal(videoId, locale).finally(() => {
    // Clean up the cache entry once the promise resolves or rejects
    console.debug(
      `fetchReviewData: cleaning up pending promise for cacheKey=${cacheKey}`,
    );
    pendingFetches.delete(cacheKey);
  });

  pendingFetches.set(cacheKey, promise);
  return promise;
}
