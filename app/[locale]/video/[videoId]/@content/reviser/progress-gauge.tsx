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
  const { fillHeight, fillColorClass, emoji } = useMemo(() => {
    // Color thresholds with Tailwind classes
    let fillColorClass = '';
    let emoji;
    if (completionPct === 100) {
      fillColorClass = 'bg-linear-to-t from-emerald-500 to-emerald-400';
      emoji = '🎉';
    } else if (completionPct >= 67) {
      fillColorClass = 'bg-linear-to-t from-teal-500 to-teal-400';
      emoji = '🚀';
    } else if (completionPct >= 34) {
      fillColorClass = 'bg-linear-to-t from-amber-500 to-amber-400';
      emoji = '💪';
    } else if (completionPct > 0) {
      fillColorClass = 'bg-linear-to-t from-orange-500 to-orange-400';
      emoji = '📚';
    } else {
      emoji = '🌱';
    }

    return {
      fillHeight: `${completionPct}%`,
      fillColorClass,
      emoji,
    };
  }, [completionPct]);

  return (
    <div className="sticky top-1/2 flex h-64 w-12 shrink-0 flex-col items-center gap-3 self-start">
      <div className="flex h-64 w-12 flex-col items-center justify-end rounded-full border-4 border-stone-300 bg-stone-100 p-1 shadow-lg dark:border-slate-600 dark:bg-slate-800">
        <div
          className={twMerge(
            'aspect-square max-w-full rounded-full shadow-md transition-all duration-300 ease-out',
            fillColorClass,
          )}
          style={{ height: fillHeight }}
        />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-2xl transition-transform duration-300 hover:scale-125">
          {emoji}
        </span>
        <span className="text-sm font-bold text-stone-700 dark:text-stone-200">
          {completionPct}%
        </span>
      </div>
    </div>
  );
}
