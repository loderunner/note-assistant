import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  type Segment,
  type Transcript,
  type TranscriptErrorType,
  getVideoTranscript,
} from '@/youtube/video-info';

export type { Segment, Transcript, TranscriptErrorType };

const segmentSchema = z.object({
  /** The text content of the segment. */
  text: z.string(),
  /** Start time in milliseconds. */
  start: z.number(),
  /** Duration in milliseconds. */
  duration: z.number(),
});

const transcriptSchema = z.object({
  /** Array of transcript segments with timing information. */
  segments: z.array(segmentSchema),
  /** Full concatenated transcript text. */
  fullText: z.string(),
  /** Optional language code of the transcript. */
  language: z.string().optional(),
  /** Video duration in milliseconds. */
  duration: z.number(),
});

const transcriptErrorTypeSchema = z.enum(['no_transcript', 'fetch_failed']);

const successResponseSchema = z.object({
  /** The transcript data. */
  transcript: transcriptSchema,
});

const errorResponseSchema = z.object({
  /** The error type. */
  error: transcriptErrorTypeSchema,
});

export type TranscriptSuccessResponse = z.infer<typeof successResponseSchema>;
export type TranscriptErrorResponse = z.infer<typeof errorResponseSchema>;

export { errorResponseSchema, successResponseSchema };

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
