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
  console.debug(`getVideoTitle: fetching for video=${videoId}`);
  try {
    const yt = await getInnertube();
    const video = await yt.getInfo(videoId);
    const title = video.basic_info.title ?? null;
    console.info(`getVideoTitle: success for video=${videoId} title="${title}"`);
    return title;
  } catch (error) {
    // Handle error here by returning null - don't rethrow
    console.error(`getVideoTitle: failed for video=${videoId}:`, error);
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
  console.debug(`getVideoTranscript: starting for video=${videoId}`);

  // Check cache first
  const cached = await transcriptCache.get(videoId);
  if (cached !== null) {
    console.info(
      `getVideoTranscript: cache hit for video=${videoId} segments=${cached.segments.length}`,
    );
    return { success: true, transcript: cached };
  }

  console.debug(`getVideoTranscript: cache miss, fetching from YouTube for video=${videoId}`);

  try {
    const yt = await getInnertube();
    console.debug(`getVideoTranscript: got Innertube instance, fetching video info for video=${videoId}`);
    const video = await yt.getInfo(videoId);

    // Get caption track URL from video info
    const captionTracks = video.captions?.caption_tracks;
    if (captionTracks === undefined || captionTracks.length === 0) {
      console.info(`getVideoTranscript: no caption tracks for video=${videoId}`);
      return { success: false, errorType: 'no_transcript' };
    }

    // Prefer first available track (usually original language)
    const captionTrack = captionTracks[0];
    const { base_url: baseURL } = captionTrack;

    console.debug(
      `getVideoTranscript: fetching timedtext for video=${videoId} language=${captionTrack.language_code}`,
    );

    // Fetch transcript as JSON from timedtext API
    const transcriptURL = new URL(baseURL);
    transcriptURL.searchParams.set('fmt', 'json3');

    const response = await fetch(transcriptURL.toString());
    if (!response.ok) {
      // Handle error here by returning result - don't rethrow
      console.error(
        `getVideoTranscript: timedtext fetch failed for video=${videoId} status=${response.status}`,
      );
      return { success: false, errorType: 'fetch_failed' };
    }

    const timedTextData = (await response.json()) as TimedTextResponse;

    if (timedTextData.events === undefined) {
      console.info(`getVideoTranscript: no events in timedtext for video=${videoId}`);
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
      `getVideoTranscript: success for video=${videoId} segments=${segments.length} chars=${fullText.length} duration=${duration}ms`,
    );

    // Cache for 30 days - transcripts don't change
    console.debug(`getVideoTranscript: caching transcript for video=${videoId}`);
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
    // Handle error here by returning result - don't rethrow
    // Check if it's genuinely a "no transcript" error vs a transient failure
    if (
      error instanceof Error &&
      (error.message.includes('Transcript') ||
        error.message.includes('transcript') ||
        error.message.includes('no transcript'))
    ) {
      console.info(
        `getVideoTranscript: no transcript available for video=${videoId}:`,
        error.message,
      );
      return { success: false, errorType: 'no_transcript' };
    }

    console.error(`getVideoTranscript: failed for video=${videoId}:`, error);
    return { success: false, errorType: 'fetch_failed' };
  }
}
