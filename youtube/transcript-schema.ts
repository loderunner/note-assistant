import { z } from 'zod';

/**
 * Schema for a single transcript segment.
 */
export const segmentSchema = z.object({
  /** The text content of the segment. */
  text: z.string(),
  /** Start time in milliseconds. */
  start: z.number(),
  /** Duration in milliseconds. */
  duration: z.number(),
});

/**
 * A single transcript segment with timing information.
 */
export type Segment = z.infer<typeof segmentSchema>;

/**
 * Schema for a full transcript.
 */
export const transcriptSchema = z.object({
  /** Array of transcript segments with timing information. */
  segments: z.array(segmentSchema),
  /** Full concatenated transcript text. */
  fullText: z.string(),
  /** Optional language code of the transcript. */
  language: z.string().optional(),
  /** Video duration in milliseconds. */
  duration: z.number(),
});

/**
 * Full transcript data for a video.
 */
export type Transcript = z.infer<typeof transcriptSchema>;

/**
 * Schema for transcript error types.
 */
export const transcriptErrorTypeSchema = z.enum([
  'no_transcript',
  'fetch_failed',
]);

/**
 * Types of errors that can occur when fetching a transcript.
 * - `no_transcript`: The video has no available transcript
 * - `fetch_failed`: A transient error occurred while fetching
 */
export type TranscriptErrorType = z.infer<typeof transcriptErrorTypeSchema>;

/**
 * Schema for a successful transcript API response.
 */
export const successResponseSchema = z.object({
  /** The transcript data. */
  transcript: transcriptSchema,
});

/**
 * Successful transcript API response.
 */
export type TranscriptSuccessResponse = z.infer<typeof successResponseSchema>;

/**
 * Schema for an error transcript API response.
 */
export const errorResponseSchema = z.object({
  /** The error type. */
  error: transcriptErrorTypeSchema,
});

/**
 * Error transcript API response.
 */
export type TranscriptErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Result of a transcript fetch attempt.
 */
export type TranscriptResult =
  | { success: true; transcript: Transcript }
  | { success: false; errorType: TranscriptErrorType };
