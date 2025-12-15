import { openai } from '@ai-sdk/openai';
import { Output, generateText } from 'ai';
import { z } from 'zod';

import { type Locale } from '@/i18n/config';

const bulletPointsSchema = z.object({
  points: z
    .array(z.string())
    .describe('List of key points to retain from the video'),
});

type BulletPointsResult = z.infer<typeof bulletPointsSchema>;

type Cache = {
  has(key: string): boolean;
  get(key: string): Promise<BulletPointsResult> | undefined;
  set(key: string, value: Promise<BulletPointsResult>): void;
};

/**
 * No-op cache implementation that doesn't cache anything.
 */
const noOpCache: Cache = {
  has: () => false,
  get: () => undefined,
  set: () => {},
};

/**
 * Cache for bullet points generation results.
 * In development, uses a no-op implementation to disable caching.
 */
const summaryCache: Cache =
  process.env.NODE_ENV === 'development'
    ? noOpCache
    : new Map<string, Promise<BulletPointsResult>>();

/**
 * Prompt templates for bullet point generation in different locales.
 */
const promptTemplates: Record<
  Locale,
  {
    instruction: (count: number) => string;
    criteria: string;
    languageNote: string;
    transcriptLabel: string;
  }
> = {
  en: {
    instruction: (count: number) =>
      `Analyze this video transcript and extract the ${count} most important key points that a student should have noted. Points should remain short and concise.`,
    criteria: `Points to retain:
- Important facts and essential information
- Significant dates, names, and numbers
- Key concepts explained
- Main conclusions`,
    languageNote:
      'Important: Respond in the same language as the transcript. If the transcript is in English, respond in English. If it is in French, respond in French, etc.',
    transcriptLabel: 'Transcript:',
  },
  fr: {
    instruction: (count: number) =>
      `Analyse cette transcription de vidéo et extrais les ${count} points clés les plus importants que l'étudiant devrait avoir notés. Les points doivent rester courts et concis.`,
    criteria: `Points à retenir:
- Les faits importants et informations essentielles
- Les dates, noms, et chiffres significatifs
- Les concepts clés expliqués
- Les conclusions principales`,
    languageNote:
      'Important: Réponds dans la même langue que la transcription. Si la transcription est en anglais, réponds en anglais. Si elle est en français, réponds en français, etc.',
    transcriptLabel: 'Transcription:',
  },
};

/**
 * Generates key bullet points from a video transcript.
 * The output language matches the transcript language.
 *
 * @param transcript - The full transcript text
 * @param videoId - The video ID for caching
 * @param duration - Video duration in milliseconds (for adaptive bullet count)
 * @param locale - The user's locale for prompt language
 * @returns Array of key bullet points
 *
 * @example
 * ```ts
 * const result = await generateBulletPoints(
 *   "Hello, today we'll discuss...",
 *   "dQw4w9WgXcQ",
 *   300000,
 *   "en"
 * );
 * console.log(result.points);
 * ```
 */
export async function generateBulletPoints(
  transcript: string,
  videoId: string,
  duration: number,
  locale: Locale = 'en',
): Promise<BulletPointsResult> {
  const cacheKey = `${videoId}-${locale}`;
  if (summaryCache.has(cacheKey)) {
    return summaryCache.get(cacheKey)!;
  }

  // Convert milliseconds to minutes for bullet count calculation
  const durationMinutes = Math.ceil(duration / 60000);
  const targetCount = Math.max(5, Math.min(12, Math.ceil(durationMinutes / 2)));

  const template = promptTemplates[locale];
  const prompt = `${template.instruction(targetCount)}

${template.criteria}

${template.languageNote}

${template.transcriptLabel}
${transcript}`;

  const promise = generateText({
    model: openai('gpt-4.1-mini'),
    output: Output.object({ schema: bulletPointsSchema }),
    prompt,
  }).then(({ output }) => output);

  summaryCache.set(cacheKey, promise);
  return promise;
}
