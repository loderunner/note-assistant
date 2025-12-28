import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateBulletPoints } from '@/app/summary/generate';
import { type Locale, isValidLocale } from '@/i18n/config';

const requestBodySchema = z.object({
  /** The transcript text to generate bullet points from. */
  transcript: z.string(),
  /** The YouTube video ID. */
  videoId: z.string(),
  /** The duration of the video in milliseconds. */
  duration: z.number(),
  /** The user's locale for prompt language. */
  locale: z.string().optional(),
});

const successResponseSchema = z.object({
  /** Array of bullet points generated from the transcript. */
  points: z.array(z.string()),
});

const errorResponseSchema = z.object({
  /** Error message. */
  error: z.string(),
  /** Optional error details. */
  details: z.unknown().optional(),
});

export type GenerateBulletsRequest = z.infer<typeof requestBodySchema>;
export type GenerateBulletsSuccessResponse = z.infer<
  typeof successResponseSchema
>;
export type GenerateBulletsErrorResponse = z.infer<typeof errorResponseSchema>;

export { errorResponseSchema, successResponseSchema };

/**
 * API route to generate bullet points from a transcript.
 */
export async function POST(
  request: NextRequest,
): Promise<
  NextResponse<GenerateBulletsSuccessResponse | GenerateBulletsErrorResponse>
> {
  console.debug('POST /api/generate-bullets - incoming request');

  try {
    const body = await request.json();
    const parseResult = requestBodySchema.safeParse(body);

    if (!parseResult.success) {
      console.warn(
        'POST /api/generate-bullets - invalid request body:',
        z.prettifyError(parseResult.error),
      );
      const errorResponse = errorResponseSchema.parse({
        error: 'Invalid request body',
        details: z.prettifyError(parseResult.error),
      });
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const {
      transcript,
      videoId,
      duration,
      locale: rawLocale,
    } = parseResult.data;
    const locale: Locale =
      rawLocale !== undefined && isValidLocale(rawLocale) ? rawLocale : 'en';

    console.info(
      `POST /api/generate-bullets - generating for video=${videoId} locale=${locale} duration=${duration}ms transcript=${transcript.length} chars`,
    );
    const result = await generateBulletPoints(
      transcript,
      videoId,
      duration,
      locale,
    );

    console.info(
      `POST /api/generate-bullets - success, generated ${result.points.length} points for video=${videoId}`,
    );
    const validatedResult = successResponseSchema.parse(result);
    return NextResponse.json(validatedResult);
  } catch (error) {
    console.error('POST /api/generate-bullets - internal server error:', error);
    const errorResponse = errorResponseSchema.parse({
      error: 'Internal server error',
    });
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
