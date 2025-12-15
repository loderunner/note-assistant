/**
 * Extracts the video ID from a YouTube URL.
 * Supports multiple YouTube URL formats.
 *
 * @param url - The YouTube URL to validate
 * @returns The video ID if valid, null otherwise
 *
 * @example
 * const videoId = extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
 * // videoId === 'dQw4w9WgXcQ'
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match !== null) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube URL.
 *
 * @param url - The URL to validate
 * @returns true if valid YouTube URL, false otherwise
 *
 * @example
 * isValidYouTubeURL('https://youtu.be/dQw4w9WgXcQ'); // true
 * isValidYouTubeURL('https://example.com'); // false
 */
export function isValidYouTubeURL(url: string): boolean {
  return extractVideoId(url) !== null;
}
