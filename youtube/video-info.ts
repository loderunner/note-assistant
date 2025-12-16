import { getInnertube } from './token-generator';
import {
  type Segment,
  type Transcript,
  type TranscriptResult,
  transcriptSchema,
} from './transcript-schema';

import { createBlobCache } from '@/cache/blob-cache';

/**
 * Response format from YouTube's timedtext API (fmt=json3).
 */
type TimedTextResponse = {
  events?: Array<{
    /** Start time in milliseconds */
    tStartMs?: number;
    /** Duration in milliseconds */
    dDurationMs?: number;
    /** Segments of text */
    segs?: Array<{
      /** UTF-8 text content */
      utf8?: string;
    }>;
  }>;
};

const transcriptCache =
  process.env.NODE_ENV === 'development'
    ? {
        get: async () => null as Transcript | null,
        set: async () => {},
      }
    : createBlobCache('transcripts/', transcriptSchema);

/**
 * Fetches the title of a YouTube video.
 *
 * @param videoId - The YouTube video ID
 * @returns The video title, or null if the video cannot be fetched
 *
 * @example
 * const title = await getVideoTitle('dQw4w9WgXcQ');
 * if (title !== null) {
 *   console.log('Video title:', title);
 * }
 */
export async function getVideoTitle(videoId: string): Promise<string | null> {
  console.info('Fetching video title for', videoId);
  try {
    const yt = await getInnertube();
    const video = await yt.getInfo(videoId);
    const title = video.basic_info.title ?? null;
    console.info('Got video title:', title);
    return title;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return null;
  }
}

/**
 * Fetches the transcript for a YouTube video.
 *
 * Uses youtubei.js with PO tokens (generated via BgUtils) to get video info,
 * then fetches the transcript directly from YouTube's timedtext API.
 *
 * @param videoId - The YouTube video ID
 * @returns A result object indicating success with transcript data,
 *          or failure with an error type.
 *
 * @example
 * const result = await getVideoTranscript('dQw4w9WgXcQ');
 * if (result.success) {
 *   console.log(result.transcript.fullText);
 * } else if (result.errorType === 'no_transcript') {
 *   console.log('This video has no transcript');
 * }
 */
export async function getVideoTranscript(
  videoId: string,
): Promise<TranscriptResult> {
  // Check cache first
  const cached = await transcriptCache.get(videoId);
  if (cached !== null) {
    console.info('Transcript cache hit for', videoId);
    return { success: true, transcript: cached };
  }

  console.info('Fetching transcript for', videoId);

  try {
    const yt = await getInnertube();
    const video = await yt.getInfo(videoId);

    // Get caption track URL from video info
    const captionTracks = video.captions?.caption_tracks;
    if (captionTracks === undefined || captionTracks.length === 0) {
      console.info('No caption tracks available for', videoId);
      return { success: false, errorType: 'no_transcript' };
    }

    // Prefer first available track (usually original language)
    const captionTrack = captionTracks[0];
    const { base_url: baseURL } = captionTrack;

    console.info(
      'Fetching timedtext for',
      videoId,
      'language:',
      captionTrack.language_code,
    );

    // Fetch transcript as JSON from timedtext API
    const transcriptURL = new URL(baseURL);
    transcriptURL.searchParams.set('fmt', 'json3');

    const response = await fetch(transcriptURL.toString());
    if (!response.ok) {
      console.error('Failed to fetch timedtext:', response.status);
      return { success: false, errorType: 'fetch_failed' };
    }

    const timedTextData = (await response.json()) as TimedTextResponse;

    if (timedTextData.events === undefined) {
      console.info('No events in timedtext response for', videoId);
      return { success: false, errorType: 'no_transcript' };
    }

    const segments: Segment[] = [];
    let fullText = '';

    for (const event of timedTextData.events) {
      // Skip events without segs (these are usually just timing markers)
      if (event.segs === undefined) {
        continue;
      }

      const text = event.segs.map((seg) => seg.utf8 ?? '').join('');
      if (text.trim() === '') {
        continue;
      }

      fullText += text;
      segments.push({
        text,
        start: event.tStartMs ?? 0,
        duration: event.dDurationMs ?? 0,
      });
    }

    // Get video duration from video info (convert seconds to milliseconds)
    const durationSeconds = video.basic_info.duration ?? 0;
    const duration = durationSeconds * 1000;

    const transcriptData: Transcript = {
      segments,
      fullText: fullText.trim(),
      language: captionTrack.language_code,
      duration,
    };

    console.info(
      'Got transcript for',
      videoId,
      '-',
      segments.length,
      'segments,',
      fullText.length,
      'chars',
    );

    // Cache for 30 days - transcripts don't change
    await transcriptCache.set(
      videoId,
      transcriptData,
      30 * 24 * 60 * 60 * 1000,
    );

    return {
      success: true,
      transcript: transcriptData,
    };
  } catch (error) {
    console.error('Error fetching transcript:', error);

    // Check if it's genuinely a "no transcript" error vs a transient failure
    if (
      error instanceof Error &&
      (error.message.includes('Transcript') ||
        error.message.includes('transcript') ||
        error.message.includes('no transcript'))
    ) {
      return { success: false, errorType: 'no_transcript' };
    }

    return { success: false, errorType: 'fetch_failed' };
  }
}
