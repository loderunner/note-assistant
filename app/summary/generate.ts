import { openai } from '@ai-sdk/openai';
import { Output, generateText } from 'ai';
import { z } from 'zod';

const bulletPointsSchema = z.object({
  points: z
    .array(z.string())
    .describe('Liste des points clés à retenir de la vidéo'),
});

type BulletPointsResult = z.infer<typeof bulletPointsSchema>;

const summaryCache = new Map<string, Promise<BulletPointsResult>>();

/**
 * Generates key bullet points from a video transcript.
 * The output language matches the transcript language.
 *
 * @param transcript - The full transcript text
 * @param videoId - The video ID for caching
 * @param duration - Video duration in milliseconds (for adaptive bullet count)
 * @returns Array of key bullet points
 */
export async function generateBulletPoints(
  transcript: string,
  videoId: string,
  duration: number,
): Promise<BulletPointsResult> {
  if (summaryCache.has(videoId)) {
    return summaryCache.get(videoId)!;
  }

  // Convert milliseconds to minutes for bullet count calculation
  const durationMinutes = Math.ceil(duration / 60000);
  const targetCount = Math.max(5, Math.min(12, Math.ceil(durationMinutes / 2)));

  const prompt = `Analyse cette transcription de vidéo et extrais les ${targetCount} points clés les plus importants que l'étudiant devrait avoir notés. Les points doivent rester courts et concis.

Points à retenir:
- Les faits importants et informations essentielles
- Les dates, noms, et chiffres significatifs
- Les concepts clés expliqués
- Les conclusions principales

Important: Réponds dans la même langue que la transcription. Si la transcription est en anglais, réponds en anglais. Si elle est en français, réponds en français, etc.

Transcription:
${transcript}`;

  const promise = generateText({
    model: openai('gpt-4.1-mini'),
    output: Output.object({ schema: bulletPointsSchema }),
    prompt,
  }).then(({ output }) => output);

  summaryCache.set(videoId, promise);
  return promise;
}
