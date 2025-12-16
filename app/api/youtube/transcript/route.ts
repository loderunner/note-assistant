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
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');

  if (videoId === null) {
    const errorResponse = errorResponseSchema.parse({
      error: 'fetch_failed',
    });
    return NextResponse.json(errorResponse, { status: 400 });
  }

  console.info('Fetching transcript for video', videoId);
  const result = await getVideoTranscript(videoId);

  if (result.success) {
    const validatedTranscript = transcriptSchema.parse(result.transcript);
    const successResponse = successResponseSchema.parse({
      transcript: validatedTranscript,
    });
    return NextResponse.json(successResponse);
  }

  const errorResponse = errorResponseSchema.parse({
    error: result.errorType,
  });
  return NextResponse.json(errorResponse);
}
