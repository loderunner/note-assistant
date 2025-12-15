import { YTNodes } from 'youtubei.js';

import { getInnertube, invalidateSession } from './innertube';

const TranscriptSegment = YTNodes.TranscriptSegment;
type TranscriptSegment = InstanceType<typeof TranscriptSegment>;

/**
 * A segment of a video transcript with timing information.
 */
export type Segment = {
  /** The text content of the segment. */
  text: string;
  /** Start time in milliseconds. */
  start: number;
  /** Duration in milliseconds. */
  duration: number;
};

/**
 * A complete video transcript.
 */
export type Transcript = {
  /** Array of transcript segments with timing information. */
  segments: Segment[];
  /** Full concatenated transcript text. */
  fullText: string;
  /** Optional language code of the transcript. */
  language?: string;
  /** Video duration in milliseconds. */
  duration: number;
};

/**
 * Error types for transcript fetching.
 * - `no_transcript`: The video does not have a transcript available.
 * - `fetch_failed`: A transient error occurred (e.g., YouTube rate limiting).
 */
export type TranscriptErrorType = 'no_transcript' | 'fetch_failed';

/**
 * Result of a transcript fetch attempt.
 */
export type TranscriptResult =
  | { success: true; transcript: Transcript }
  | { success: false; errorType: TranscriptErrorType };

/**
 * Checks if an error is a YouTube precondition failure (stale session).
 */
function isPreconditionError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('400') ||
      error.message.includes('Precondition') ||
      error.message.includes('failedPrecondition')
    );
  }
  return false;
}

const MAX_RETRIES = 2;

/**
 * Fetches the title of a YouTube video.
 *
 * @param videoId - The YouTube video ID
 * @returns The video title, or null if the video cannot be fetched
 *
 * @example
 * const title = await getVideoTitle('dQw4w9WgXcQ');
 * if (title !== null) {
 *   console.log('Video title:', title);
 * }
 */
export async function getVideoTitle(videoId: string): Promise<string | null> {
  try {
    const yt = await getInnertube();
    const video = await yt.getInfo(videoId);
    return video.basic_info.title ?? null;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return null;
  }
}

/**
 * Fetches the transcript for a YouTube video with retry on precondition errors.
 *
 * @param videoId - The YouTube video ID
 * @param attempt - The current retry attempt (used internally)
 * @returns A result object indicating success with transcript data,
 *          or failure with an error type.
 *
 * @example
 * const result = await getVideoTranscript('dQw4w9WgXcQ');
 * if (result.success) {
 *   console.log(result.transcript.fullText);
 * } else if (result.errorType === 'no_transcript') {
 *   console.log('This video has no transcript');
 * }
 */
export async function getVideoTranscript(
  videoId: string,
  attempt: number = 0,
): Promise<TranscriptResult> {
  try {
    const yt = await getInnertube();
    const video = await yt.getInfo(videoId);
    const transcript = await video.getTranscript();

    const entries = transcript.transcript.content?.body?.initial_segments;
    if (entries === undefined) {
      return { success: false, errorType: 'no_transcript' };
    }

    const segments: Segment[] = [];
    let fullText = '';

    for (const entry of entries) {
      if (entry instanceof TranscriptSegment) {
        fullText += entry.snippet.text ?? '';
        segments.push({
          text: entry.snippet.text ?? '',
          start: Number(entry.start_ms),
          duration: Number(entry.end_ms) - Number(entry.start_ms),
        });
      }
    }

    // Get video duration from video info (convert seconds to milliseconds)
    const durationSeconds = video.basic_info.duration ?? 0;
    const duration = durationSeconds * 1000;

    return {
      success: true,
      transcript: {
        segments,
        fullText: fullText.trim(),
        language: transcript.selectedLanguage,
        duration,
      },
    };
  } catch (error) {
    console.error(
      `Error fetching transcript (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`,
      error,
    );

    // If it's a precondition error, invalidate session and retry
    if (isPreconditionError(error) && attempt < MAX_RETRIES) {
      console.info('Invalidating stale session and retrying...');
      invalidateSession();
      // Small delay before retry
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      return getVideoTranscript(videoId, attempt + 1);
    }

    // Check if it's genuinely a "no transcript" error vs a transient failure
    if (
      error instanceof Error &&
      (error.message.includes('Transcript') ||
        error.message.includes('transcript'))
    ) {
      return { success: false, errorType: 'no_transcript' };
    }

    return { success: false, errorType: 'fetch_failed' };
  }
}
