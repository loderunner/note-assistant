'use client';

import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

type ProgressGaugeProps = {
  /** Completion percentage (0-100) */
  completionPct: number;
};

/**
 * Vertical progress gauge positioned to the left of the bullet points list.
 * Changes color based on completion thresholds with smooth Tailwind transitions.
 */
export function ProgressGauge({ completionPct }: ProgressGaugeProps) {
  const { fillHeight, fillColorClass } = useMemo(() => {
    // Color thresholds with Tailwind classes
    let fillColorClass = '';
    if (completionPct === 100) {
      fillColorClass = 'bg-gradient-to-t from-emerald-500 to-emerald-400';
    } else if (completionPct >= 67) {
      fillColorClass = 'bg-gradient-to-t from-blue-500 to-blue-400';
    } else if (completionPct >= 34) {
      fillColorClass = 'bg-gradient-to-t from-yellow-500 to-yellow-400';
    } else {
      fillColorClass = 'bg-gradient-to-t from-orange-500 to-orange-400';
    }

    return {
      fillHeight: `${completionPct}%`,
      fillColorClass,
    };
  }, [completionPct]);

  return (
    <div className="sticky top-1/2 flex h-64 w-12 shrink-0 flex-col items-center gap-2 self-start">
      <div className="flex h-64 w-12 flex-col items-center justify-end rounded-full border-2 border-gray-300 bg-gray-100 p-1 dark:border-gray-600 dark:bg-gray-800">
        <div
          className={twMerge(
            'aspect-square max-w-full rounded-full transition-all duration-300 ease-out',
            fillColorClass,
          )}
          style={{ height: fillHeight }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {completionPct}%
      </span>
    </div>
  );
}
