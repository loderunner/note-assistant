import { openai } from '@ai-sdk/openai';
import { experimental_transcribe } from 'ai';
import { Innertube } from 'youtubei.js';

type TranscriptResult = {
  segments: Array<{ text: string; start: number; duration: number }>;
  fullText: string;
  language?: string;
};

/**
 * Downloads audio from a YouTube video and transcribes it using OpenAI.
 *
 * @param videoId - The YouTube video ID
 * @returns The transcribed text segments
 */
export async function transcribeAudio(
  videoId: string,
): Promise<TranscriptResult | null> {
  try {
    const yt = await Innertube.create();
    const video = await yt.getInfo(videoId);

    const format = video.chooseFormat({ type: 'audio', quality: 'best' });

    const downloadOptions = {
      ...format,
      language: format.language ?? undefined,
    };

    const stream = await video.download(downloadOptions);
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);

    const result = await experimental_transcribe({
      model: openai.transcription('gpt-4o-mini-transcribe'),
      audio: audioBuffer,
    });

    const segments = [
      {
        text: result.text,
        start: 0,
        duration: 0,
      },
    ];

    return {
      segments,
      fullText: result.text,
      language: result.language,
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return null;
  }
}
