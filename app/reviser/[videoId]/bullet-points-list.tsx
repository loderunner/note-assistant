'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

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
    <motion.ul
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl space-y-4"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.3, staggerChildren: 0.1 }}
    >
      {points.map((point, index) => (
        <motion.li
          key={index}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          initial={{ opacity: 0, x: -20 }}
          transition={{ delay: 0.3 + index * 0.1 }}
        >
          <button
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors"
            style={{
              borderColor: checkedStates[index] ? '#10b981' : 'currentColor',
              backgroundColor: checkedStates[index] ? '#10b981' : 'transparent',
            }}
            onClick={() => toggleCheck(index)}
          >
            {checkedStates[index] && (
              <motion.svg
                animate={{ scale: 1 }}
                className="h-3 w-3 text-white"
                fill="none"
                initial={{ scale: 0 }}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                />
              </motion.svg>
            )}
          </button>
          <p className="flex-1 text-gray-800 dark:text-gray-200">{point}</p>
        </motion.li>
      ))}
    </motion.ul>
  );
}
