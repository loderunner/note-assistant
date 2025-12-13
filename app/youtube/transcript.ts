import { openai } from '@ai-sdk/openai';
import { experimental_transcribe } from 'ai';
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
 * Gets transcript for a video, trying official transcript first, then audio transcription fallback.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcript result or null if both methods fail
 */
export async function getTranscript(
  videoId: string,
): Promise<Transcript | null> {
  console.info('Getting transcript for video', videoId);
  const officialTranscript = await fetchTranscript(videoId);
  if (officialTranscript !== null) {
    console.info('Found official transcript');
    return officialTranscript;
  }

  console.info('No official transcript found, transcribing audio');
  return transcribeAudio(videoId);
}

const transcriptCache = new Map<string, Promise<Transcript | null>>();

/**
 * Fetches the official transcript for a YouTube video.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcript segments and full text, or null if not available
 */
async function fetchTranscript(videoId: string): Promise<Transcript | null> {
  console.info('Fetching transcript for video', videoId);
  const cachedTranscript = transcriptCache.get(videoId);
  if (cachedTranscript !== undefined) {
    console.info('Returning cached transcript for video', videoId);
    return cachedTranscript;
  }

  const promise = (async () => {
    try {
      console.info('Creating Innertube instance');
      const yt = await Innertube.create();

      console.info('Getting video info for video', videoId);
      const video = await yt.getInfo(videoId);
      console.info('Video info for video', videoId);

      console.info('Getting transcript for video', videoId);
      const transcript = await video.getTranscript();
      console.info('Transcript for video', videoId);

      const segments: Segment[] = [];
      let fullText = '';

      const entries = transcript.transcript.content?.body?.initial_segments;
      if (entries === undefined) {
        console.error('No entries found for video', videoId);
        throw new Error('No entries found for video');
      }

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

      console.info('Returning transcript for video', videoId);
      console.info(`${segments.length} segments`);
      console.info(`${fullText.length} characters`);
      console.info(`Language: ${transcript.selectedLanguage}`);
      return {
        segments,
        fullText: fullText.trim(),
        language: transcript.selectedLanguage,
      };
    } catch (error) {
      console.error('Error fetching transcript:', error);
      transcriptCache.delete(videoId);
      return null;
    }
  })();

  transcriptCache.set(videoId, promise);
  return promise;
}

/**
 * Downloads audio from a YouTube video and transcribes it using OpenAI.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcribed text segments
 */
export async function transcribeAudio(
  videoId: string,
): Promise<Transcript | null> {
  try {
    console.info('Transcribing audio for video', videoId);
    const yt = await Innertube.create();

    console.info('Getting video info for video', videoId);
    const video = await yt.getInfo(videoId);

    console.info('Choosing format for video', videoId);
    const format = video.chooseFormat({
      type: 'audio',
    });

    const downloadOptions = {
      ...format,
      language: format.language ?? undefined,
    };

    console.info('Downloading audio for video', videoId);
    const stream = await video.download(downloadOptions);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    console.info(
      `Audio buffer for video ${videoId} has ${audioBuffer.length} bytes`,
    );

    console.info('Transcribing audio for video', videoId);
    const result = await experimental_transcribe({
      model: openai.transcription('gpt-4o-mini-transcribe'),
      audio: audioBuffer,
    });
    console.info('Transcription result for video', videoId);
    console.info(`${result.text.length} characters`);
    console.info(`Language: ${result.language}`);

    return {
      segments: [],
      fullText: result.text,
      language: result.language,
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return null;
  }
}
