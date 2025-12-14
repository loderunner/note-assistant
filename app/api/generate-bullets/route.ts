import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { generateBulletPoints } from '@/app/summary/generate';

const requestBodySchema = z.object({
  /** The transcript text to generate bullet points from. */
  transcript: z.string(),
  /** The YouTube video ID. */
  videoId: z.string(),
  /** The duration of the video in minutes. */
  videoDurationMinutes: z.number(),
});

/**
 * API route to generate bullet points from a transcript.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = requestBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: z.prettifyError(parseResult.error),
        },
        { status: 400 },
      );
    }

    const { transcript, videoId, videoDurationMinutes } = parseResult.data;

    console.info('Generating bullet points for video', videoId);
    const result = await generateBulletPoints(
      transcript,
      videoId,
      videoDurationMinutes,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-bullets API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
