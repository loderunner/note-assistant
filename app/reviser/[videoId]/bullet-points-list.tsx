'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

type BulletPointsListProps = {
  points: string[];
};

export function BulletPointsList({ points }: BulletPointsListProps) {
  const [checkedStates, setCheckedStates] = useState<boolean[]>(
    new Array(points.length).fill(false),
  );

  const toggleCheck = (index: number) => {
    setCheckedStates((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <ul className="w-full max-w-4xl space-y-4">
      {points.map((point, index) => {
        const checked = checkedStates[index];
        return (
          <li
            key={index}
            className={twMerge(
              'flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-250 ease-out dark:border-gray-700 dark:bg-gray-900',
              checked
                ? 'translate-x-4 opacity-50'
                : 'translate-x-0 opacity-100',
            )}
          >
            <button
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
              style={{
                borderColor: checked ? '#10b981' : 'currentColor',
                backgroundColor: checked ? '#10b981' : 'transparent',
              }}
              onClick={() => toggleCheck(index)}
            >
              {checked && (
                <svg
                  className="h-3 w-3 scale-100 text-white transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                  />
                </svg>
              )}
            </button>
            <p className="flex-1 text-gray-800 dark:text-gray-200">{point}</p>
          </li>
        );
      })}
    </ul>
  );
}
