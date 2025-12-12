import { transcribeAudio } from './audio-transcribe';
import { fetchTranscript } from './transcript';

type TranscriptResult = {
  segments: Array<{ text: string; start: number; duration: number }>;
  fullText: string;
  language?: string;
};

/**
 * Gets transcript for a video, trying official transcript first, then audio transcription fallback.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcript result or null if both methods fail
 */
export async function getTranscript(
  videoId: string,
): Promise<TranscriptResult | null> {
  const officialTranscript = await fetchTranscript(videoId);
  if (officialTranscript != null) {
    return officialTranscript;
  }

  return transcribeAudio(videoId);
}
