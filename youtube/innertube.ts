import { Innertube } from 'youtubei.js';

/**
 * Cached Innertube instance to avoid creating new sessions on every request.
 * Creating a new instance per request causes YouTube's API to return
 * "Precondition check failed" errors due to rapid session creation from the
 * same IP being flagged as bot-like behavior.
 */
let innertubeInstance: Innertube | null = null;
let innertubePromise: Promise<Innertube> | null = null;

/**
 * Invalidates the cached Innertube session, forcing a fresh session on the
 * next request. Call this when YouTube returns precondition errors.
 */
export function invalidateSession(): void {
  innertubeInstance = null;
  innertubePromise = null;
}

/**
 * Gets a cached Innertube instance, or creates a new one if needed.
 * In development, always creates fresh instances.
 * In production, caches a single instance to avoid rate limiting.
 *
 * @returns A promise resolving to an Innertube instance
 *
 * @example
 * const yt = await getInnertube();
 * const video = await yt.getInfo('dQw4w9WgXcQ');
 */
export async function getInnertube(): Promise<Innertube> {
  if (process.env.NODE_ENV === 'development') {
    return Innertube.create();
  }

  if (innertubeInstance !== null) {
    return innertubeInstance;
  }

  if (innertubePromise !== null) {
    return innertubePromise;
  }

  innertubePromise = Innertube.create();
  innertubeInstance = await innertubePromise;
  innertubePromise = null;

  return innertubeInstance;
}
