'use client';

import {
  type TranscriptResult,
  errorResponseSchema,
  successResponseSchema,
} from '@/youtube/transcript-schema';

/**
 * Fetches the official transcript for a YouTube video from the API.
 * Calls server-side API to avoid CORS issues with YouTube.
 *
 * @param videoId - The YouTube video ID
 * @returns A result object indicating success with transcript data,
 *          or failure with an error type.
 *
 * @example
 * const result = await fetchTranscript('dQw4w9WgXcQ');
 * if (result.success) {
 *   console.log(result.transcript.fullText);
 * } else if (result.errorType === 'no_transcript') {
 *   console.log('This video has no transcript');
 * } else {
 *   console.log('Failed to fetch, try again');
 * }
 */
export async function fetchTranscript(
  videoId: string,
): Promise<TranscriptResult> {
  try {
    const response = await fetch(`/api/youtube/transcript?videoId=${videoId}`);
    if (!response.ok) {
      return { success: false, errorType: 'fetch_failed' };
    }

    const data = await response.json();

    // Validate response against schema
    const errorParseResult = errorResponseSchema.safeParse(data);
    if (errorParseResult.success) {
      return {
        success: false,
        errorType: errorParseResult.data.error,
      };
    }

    const successParseResult = successResponseSchema.safeParse(data);
    if (successParseResult.success) {
      return {
        success: true,
        transcript: successParseResult.data.transcript,
      };
    }

    // If neither schema matches, treat as fetch failure
    console.error('Invalid response format from transcript API:', data);
    return { success: false, errorType: 'fetch_failed' };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return { success: false, errorType: 'fetch_failed' };
  }
}
