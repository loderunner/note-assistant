import { type NextRequest, NextResponse } from 'next/server';
import { Innertube, YTNodes } from 'youtubei.js';
import { z } from 'zod';

const TranscriptSegment = YTNodes.TranscriptSegment;
type TranscriptSegment = InstanceType<typeof TranscriptSegment>;

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

export type Segment = z.infer<typeof segmentSchema>;
export type Transcript = z.infer<typeof transcriptSchema>;
export type TranscriptErrorType = z.infer<typeof transcriptErrorTypeSchema>;
export type TranscriptSuccessResponse = z.infer<typeof successResponseSchema>;
export type TranscriptErrorResponse = z.infer<typeof errorResponseSchema>;

export { errorResponseSchema, successResponseSchema };

/**
 * Cached Innertube instance to avoid creating new sessions on every request.
 * Creating a new instance per request causes YouTube's API to return
 * "Precondition check failed" errors due to rapid session creation from the
 * same IP being flagged as bot-like behavior.
 */
let innertubeInstance: Innertube | null = null;
let innertubePromise: Promise<Innertube> | null = null;

/**
 * Invalidates the cached Innertube session, forcing a fresh session on the
 * next request. Call this when YouTube returns precondition errors.
 */
function invalidateSession(): void {
  innertubeInstance = null;
  innertubePromise = null;
}

async function getInnertube(): Promise<Innertube> {
  if (innertubeInstance !== null) {
    return innertubeInstance;
  }

  // Avoid race conditions: if we're already creating an instance, wait for it
  if (innertubePromise !== null) {
    return innertubePromise;
  }

  innertubePromise = Innertube.create();
  innertubeInstance = await innertubePromise;
  innertubePromise = null;

  return innertubeInstance;
}

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
 * Attempts to fetch transcript for a video, with retry on precondition errors.
 */
async function fetchTranscriptWithRetry(
  videoId: string,
  attempt: number = 0,
): Promise<
  | { success: true; transcript: Transcript }
  | { success: false; errorType: TranscriptErrorType }
> {
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
      return fetchTranscriptWithRetry(videoId, attempt + 1);
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
  const result = await fetchTranscriptWithRetry(videoId);

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
