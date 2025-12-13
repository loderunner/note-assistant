'use server';

import { generateBulletPoints } from '@/app/summary/generate';
import { getTranscript } from '@/app/youtube/transcript';

type ProcessResult = {
  points: string[];
  transcriptLanguage?: string;
};

const processingCache = new Map<string, Promise<ProcessResult>>();

/**
 * Processes a video: fetches transcript and generates bullet points.
 * This runs in the background while the user watches the video.
 *
 * @param videoId - The YouTube video ID
 * @returns The generated bullet points
 */
export async function processVideo(videoId: string): Promise<ProcessResult> {
  if (processingCache.has(videoId)) {
    return processingCache.get(videoId)!;
  }

  const promise = (async () => {
    const transcriptResult = await getTranscript(videoId);
    if (transcriptResult === null) {
      throw new Error("Impossible d'obtenir la transcription de la vidéo");
    }

    const videoDurationMinutes =
      transcriptResult.segments.length > 0
        ? Math.ceil(
            (transcriptResult.segments[transcriptResult.segments.length - 1]
              .start +
              transcriptResult.segments[transcriptResult.segments.length - 1]
                .duration) /
              60,
          )
        : 10;

    const bulletPoints = await generateBulletPoints(
      transcriptResult.fullText,
      videoId,
      videoDurationMinutes,
    );

    return {
      points: bulletPoints.points,
      transcriptLanguage: transcriptResult.language,
    };
  })();

  processingCache.set(videoId, promise);
  return promise;
}
