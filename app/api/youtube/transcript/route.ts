import { type NextRequest, NextResponse } from 'next/server';
import { Innertube, YTNodes } from 'youtubei.js';

const TranscriptSegment = YTNodes.TranscriptSegment;
type TranscriptSegment = InstanceType<typeof TranscriptSegment>;

type Segment = {
  text: string;
  start: number;
  duration: number;
};

type Transcript = {
  segments: Segment[];
  fullText: string;
  language?: string;
};

/**
 * Cached Innertube instance to avoid creating new sessions on every request.
 * Creating a new instance per request causes YouTube's API to return
 * "Precondition check failed" errors due to rapid session creation from the
 * same IP being flagged as bot-like behavior.
 */
let innertubeInstance: Innertube | null = null;
let innertubePromise: Promise<Innertube> | null = null;

async function getInnertube(): Promise<Innertube> {
  if (innertubeInstance !== null) {
    return innertubeInstance;
  }

  // Avoid race conditions: if we're already creating an instance, wait for it
  if (innertubePromise !== null) {
    return innertubePromise;
  }

  innertubePromise = Innertube.create();
  innertubeInstance = await innertubePromise;
  innertubePromise = null;

  return innertubeInstance;
}

/**
 * API route to get official transcript for a YouTube video.
 * Runs server-side to avoid CORS issues.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get('videoId');

    if (videoId === null) {
      return NextResponse.json(null, { status: 404 });
    }

    console.info('Fetching transcript for video', videoId);
    const yt = await getInnertube();
    const video = await yt.getInfo(videoId);
    const transcript = await video.getTranscript();

    const entries = transcript.transcript.content?.body?.initial_segments;
    if (entries === undefined) {
      throw new Error('No transcript segments found for video');
    }

    const segments: Segment[] = [];
    let fullText = '';

    for (const entry of entries) {
      if (entry instanceof TranscriptSegment) {
        fullText += entry.snippet.text ?? '';
        segments.push({
          text: entry.snippet.text ?? '',
          start: Number(entry.start_ms),
          duration: Number(entry.end_ms) - Number(entry.start_ms),
        });
      }
    }

    const result: Transcript = {
      segments,
      fullText: fullText.trim(),
      language: transcript.selectedLanguage,
    };

    return NextResponse.json({ transcript: result });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ transcript: null });
  }
}
