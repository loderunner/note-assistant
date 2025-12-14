'use client';

import { useEffect, useRef, useState } from 'react';

import { useVideoPlayer } from '../../video-player-context';

import { BulletPointsList } from './bullet-points-list';
import { Celebration } from './celebration';
import { ProgressGauge } from './progress-gauge';
import { ReviewActions } from './review-actions';

import { successResponseSchema } from '@/app/api/generate-bullets/route';
import { getTranscript } from '@/app/youtube/client';

type ReviewDataProps = {
  /** The YouTube video ID to fetch and display bullet points for */
  videoId: string;
};

/**
 * Error types for the review data component.
 * - `no_transcript`: The video does not have a transcript available.
 * - `fetch_failed`: A transient error occurred (e.g., YouTube rate limiting).
 * - `generation_failed`: Failed to generate bullet points from transcript.
 */
type ErrorType = 'no_transcript' | 'fetch_failed' | 'generation_failed';

type LoadingState =
  | { status: 'loading'; step: 'transcript' | 'generating' }
  | { status: 'error'; errorType: ErrorType }
  | { status: 'success'; points: string[] };

/**
 * Client component that fetches bullet points for a video and displays them.
 * Only supports videos with official YouTube transcripts.
 */
export function ReviewData({ videoId }: ReviewDataProps) {
  const { playerContainerRef } = useVideoPlayer();
  const [state, setState] = useState<LoadingState>({
    status: 'loading',
    step: 'transcript',
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function processVideo() {
      // Get official transcript
      setState({ status: 'loading', step: 'transcript' });
      const transcriptResult = await getTranscript(videoId);

      if (!transcriptResult.success) {
        setState({ status: 'error', errorType: transcriptResult.errorType });
        return;
      }

      const { transcript } = transcriptResult;

      // Generate bullet points
      setState({ status: 'loading', step: 'generating' });

      try {
        const bulletsResponse = await fetch('/api/generate-bullets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transcript: transcript.fullText,
            videoId,
            duration: transcript.duration,
          }),
        });

        if (!bulletsResponse.ok) {
          setState({ status: 'error', errorType: 'generation_failed' });
          return;
        }

        const bulletsData = await bulletsResponse.json();
        const validatedData = successResponseSchema.parse(bulletsData);
        setState({ status: 'success', points: validatedData.points });
      } catch (error) {
        console.error('Error generating bullet points:', error);
        setState({ status: 'error', errorType: 'generation_failed' });
      }
    }

    processVideo();
  }, [videoId, retryCount]);

  const scrolledRef = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [checkedStates, setCheckedStates] = useState<boolean[]>([]);

  useEffect(() => {
    if (state.status === 'success') {
      setTimeout(() => {
        setCheckedStates(new Array(state.points.length).fill(false));
      }, 0);
      if (playerContainerRef !== null && !scrolledRef.current) {
        const bounds = playerContainerRef.getBoundingClientRect();
        const scrollTop = window.scrollY + bounds.bottom;
        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth',
        });
        scrolledRef.current = true;
      }
    }
    // @ts-expect-error - state.points is only available when state.status is 'success'
  }, [state.status, state.points?.length, playerContainerRef]);

  const handleToggle = (index: number) => {
    setCheckedStates((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const completionPct =
    checkedStates.length > 0
      ? Math.round(
          (checkedStates.filter(Boolean).length / checkedStates.length) * 100,
        )
      : 0;

  if (state.status === 'loading') {
    const messages = {
      transcript: 'Récupération de la transcription...',
      generating: 'Génération des points clés...',
    };

    return (
      <div className="flex w-full max-w-4xl items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 flex justify-center gap-2">
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-rose-500"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-rose-500"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="h-3 w-3 animate-bounce rounded-full bg-rose-500"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <p className="text-stone-600 dark:text-stone-300">
            {messages[state.step]}
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    const errorMessages: Record<
      ErrorType,
      { emoji: string; title: string; message: string; retryable: boolean }
    > = {
      no_transcript: {
        emoji: '📝',
        title: 'Pas de transcription',
        message:
          "Cette vidéo n'a pas de transcription disponible. Seules les vidéos avec sous-titres officiels sont supportées.",
        retryable: false,
      },
      fetch_failed: {
        emoji: '🌐',
        title: 'Erreur de connexion',
        message:
          'Impossible de récupérer la transcription depuis YouTube. Réessayez dans quelques instants.',
        retryable: true,
      },
      generation_failed: {
        emoji: '🤖',
        title: 'Erreur de génération',
        message:
          "Une erreur s'est produite lors de la génération des points clés. Réessayez.",
        retryable: true,
      },
    };

    const { emoji, title, message, retryable } = errorMessages[state.errorType];

    return (
      <div className="flex w-full max-w-4xl items-center justify-center py-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-4xl">{emoji}</div>
          <p className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </p>
          <p className="mb-6 max-w-md text-stone-600 dark:text-stone-400">
            {message}
          </p>
          {retryable && (
            <button
              className="rounded-full bg-linear-to-r from-rose-500 to-rose-600 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-rose-600 hover:to-rose-700 hover:shadow-xl active:scale-95"
              onClick={() => setRetryCount((c) => c + 1)}
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-start gap-4">
        <ProgressGauge completionPct={completionPct} />
        <BulletPointsList
          ref={listRef}
          checkedStates={checkedStates}
          points={state.points}
          onToggleAction={handleToggle}
        />
      </div>
      <Celebration trigger={completionPct === 100} />
      <ReviewActions />
    </>
  );
}
