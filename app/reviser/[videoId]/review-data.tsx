'use client';

import { useEffect, useState } from 'react';

import { BulletPointsList } from './bullet-points-list';
import { ReviewActions } from './review-actions';

import { type Transcript, getTranscript } from '@/app/youtube/client';

type ReviewDataProps = {
  /** The YouTube video ID to fetch and display bullet points for */
  videoId: string;
};

type LoadingState =
  | { status: 'loading'; step: 'transcript' | 'generating' }
  | { status: 'error'; error: string }
  | { status: 'success'; points: string[] };

/**
 * Client component that fetches bullet points for a video and displays them.
 * Only supports videos with official YouTube transcripts.
 */
export function ReviewData({ videoId }: ReviewDataProps) {
  const [state, setState] = useState<LoadingState>({
    status: 'loading',
    step: 'transcript',
  });

  useEffect(() => {
    async function processVideo() {
      try {
        // Get official transcript
        setState({ status: 'loading', step: 'transcript' });
        const transcript: Transcript | null = await getTranscript(videoId);

        if (transcript === null) {
          throw new Error(
            "Cette vidéo n'a pas de transcription disponible. Seules les vidéos avec transcription officielle sont supportées.",
          );
        }

        // Generate bullet points
        setState({ status: 'loading', step: 'generating' });

        // Calculate video duration from transcript segments
        const videoDurationMinutes =
          transcript.segments.length > 0
            ? Math.ceil(
                (transcript.segments[transcript.segments.length - 1].start +
                  transcript.segments[transcript.segments.length - 1]
                    .duration) /
                  60,
              )
            : 10;

        const bulletsResponse = await fetch('/api/generate-bullets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: transcript.fullText,
            videoId,
            videoDurationMinutes,
          }),
        });

        if (!bulletsResponse.ok) {
          throw new Error('Failed to generate bullet points');
        }

        const bulletsData = await bulletsResponse.json();
        setState({ status: 'success', points: bulletsData.points });
      } catch (error) {
        console.error('Error processing video:', error);
        setState({
          status: 'error',
          error:
            error instanceof Error ? error.message : 'Une erreur est survenue',
        });
      }
    }

    processVideo();
  }, [videoId]);

  if (state.status === 'loading') {
    const messages = {
      transcript: 'Récupération de la transcription...',
      generating: 'Génération des points clés...',
    };

    return (
      <div className="flex w-full max-w-4xl items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            {messages[state.step]}
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex w-full max-w-4xl items-center justify-center py-12">
        <div className="text-center">
          <p className="mb-4 text-lg font-medium text-red-600 dark:text-red-400">
            Erreur
          </p>
          <p className="text-gray-600 dark:text-gray-400">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BulletPointsList points={state.points} />
      <ReviewActions videoId={videoId} />
    </>
  );
}
