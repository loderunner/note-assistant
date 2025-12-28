import { type NextRequest, NextResponse } from 'next/server';

import {
  errorResponseSchema,
  successResponseSchema,
  transcriptSchema,
} from '@/youtube/transcript-schema';
import { getVideoTranscript } from '@/youtube/video-info';

/**
 * API route to get official transcript for a YouTube video.
 * Runs server-side to avoid CORS issues.
 *
 * @returns One of:
 *   - `{ transcript: Transcript }` on success
 *   - `{ error: 'no_transcript' }` when video has no transcript
 *   - `{ error: 'fetch_failed' }` on transient YouTube errors
 */
export async function GET(request: NextRequest) {
  console.debug('GET /api/youtube/transcript - incoming request');

  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (videoId === null) {
    console.warn('GET /api/youtube/transcript - missing videoId parameter');
    const errorResponse = errorResponseSchema.parse({
      error: 'fetch_failed',
    });
    return NextResponse.json(errorResponse, { status: 400 });
  }

  console.info(`GET /api/youtube/transcript - fetching for video=${videoId}`);
  const result = await getVideoTranscript(videoId);

  if (result.success) {
    const validatedTranscript = transcriptSchema.parse(result.transcript);
    console.info(
      `GET /api/youtube/transcript - success for video=${videoId} segments=${validatedTranscript.segments.length} duration=${validatedTranscript.duration}ms`,
    );
    const successResponse = successResponseSchema.parse({
      transcript: validatedTranscript,
    });
    return NextResponse.json(successResponse);
  }

  console.warn(
    `GET /api/youtube/transcript - failed for video=${videoId} errorType=${result.errorType}`,
  );
  const errorResponse = errorResponseSchema.parse({
    error: result.errorType,
  });
  return NextResponse.json(errorResponse);
}
