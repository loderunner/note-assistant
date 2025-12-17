'use client';

import { use, useEffect, useRef, useState } from 'react';

import { useVideoPlayer } from '../../video-player-context';

import { BulletPointsList } from './bullet-points-list';
import { Celebration } from './celebration';
import { ProgressGauge } from './progress-gauge';
import { ReviewActions } from './review-actions';
import { ReviewDataError } from './review-data-error';

type ReviewDataResult =
  | { success: true; points: string[] }
  | {
      success: false;
      errorType: 'no_transcript' | 'fetch_failed' | 'generation_failed';
    };

type Props = {
  reviewDataPromise: Promise<ReviewDataResult>;
};

/**
 * Client component that consumes a promise for review data.
 * Uses React's use() hook to suspend until the promise resolves,
 * enabling Suspense streaming from server components.
 */
export function ReviewDataClient({ reviewDataPromise }: Props) {
  const result = use(reviewDataPromise); // Suspends until resolved

  if (!result.success) {
    return <ReviewDataError errorType={result.errorType} />;
  }

  return <ReviewDataSuccess points={result.points} />;
}

/**
 * Success state component displaying bullet points with interactive checkboxes.
 * Handles scroll behavior and completion tracking.
 */
function ReviewDataSuccess({ points }: { points: string[] }) {
  const { playerContainerRef } = useVideoPlayer();
  const scrolledRef = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const [checkedStates, setCheckedStates] = useState<boolean[]>(() =>
    new Array(points.length).fill(false),
  );

  // Scroll to content on mount
  useEffect(() => {
    if (playerContainerRef !== null && !scrolledRef.current) {
      const bounds = playerContainerRef.getBoundingClientRect();
      window.scrollTo({
        top: window.scrollY + bounds.bottom,
        behavior: 'smooth',
      });
      scrolledRef.current = true;
    }
  }, [playerContainerRef]);

  const handleToggle = (index: number) => {
    setCheckedStates((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const completionPct = Math.round(
    (checkedStates.filter(Boolean).length / checkedStates.length) * 100,
  );

  return (
    <>
      <div className="relative flex items-start gap-4">
        <ProgressGauge completionPct={completionPct} />
        <BulletPointsList
          ref={listRef}
          checkedStates={checkedStates}
          points={points}
          onToggleAction={handleToggle}
        />
      </div>
      <Celebration trigger={completionPct === 100} />
      <ReviewActions />
    </>
  );
}
