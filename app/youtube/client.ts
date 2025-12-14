'use client';

export type Segment = {
  text: string;
  start: number;
  duration: number;
};

export type Transcript = {
  segments: Segment[];
  fullText: string;
  language?: string;
};

/**
 * Tries to get the official transcript for a YouTube video.
 * Calls server-side API to avoid CORS issues.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcript segments and full text, or null if not available
 */
export async function getTranscript(
  videoId: string,
): Promise<Transcript | null> {
  try {
    const response = await fetch(`/api/youtube/transcript?videoId=${videoId}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}
