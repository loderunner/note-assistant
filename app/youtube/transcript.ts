import { Innertube } from 'youtubei.js';

type TranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

type TranscriptResult = {
  segments: TranscriptSegment[];
  fullText: string;
  language?: string;
};

const transcriptCache = new Map<string, Promise<TranscriptResult>>();

/**
 * Fetches the official transcript for a YouTube video.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcript segments and full text, or null if not available
 */
export async function fetchTranscript(
  videoId: string,
): Promise<TranscriptResult | null> {
  if (transcriptCache.has(videoId)) {
    return transcriptCache.get(videoId)!;
  }

  const promise = (async () => {
    try {
      const yt = await Innertube.create();
      const video = await yt.getInfo(videoId);

      const transcript = await video.getTranscript();

      const segments: TranscriptSegment[] = [];
      let fullText = '';

      const transcriptData = transcript.transcript;

      const entries = Array.isArray(transcriptData)
        ? transcriptData
        : Symbol.iterator in transcriptData
          ? Array.from(
              (
                transcriptData as {
                  [Symbol.iterator]: () => IterableIterator<unknown>;
                }
              )[Symbol.iterator](),
            )
          : [];

      for (const entry of entries) {
        if (typeof entry === 'object' && entry !== null) {
          const entryObj = entry as {
            text?: string;
            start?: number;
            duration?: number;
          };
          const text = entryObj.text ?? '';
          const start = entryObj.start ?? 0;
          const duration = entryObj.duration ?? 0;
          segments.push({
            text,
            start,
            duration,
          });
          fullText += text + ' ';
        }
      }

      return {
        segments,
        fullText: fullText.trim(),
        language: (
          transcript as { languages?: Array<{ language_code?: string }> }
        ).languages?.[0]?.language_code,
      };
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return null;
    }
  })();

  transcriptCache.set(videoId, promise as Promise<TranscriptResult>);
  return promise;
}
