'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type BulletPointItemProps = {
  checked: boolean;
  index: number;
  onToggle: () => void;
  children: string;
};

function BulletPointItem({
  checked,
  index,
  onToggle,
  children: point,
}: BulletPointItemProps) {
  const [delay, setDelay] = useState(index * 100);
  const itemRef = useRef<HTMLLIElement>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const element = itemRef.current;
    if (element === null || completedRef.current) {
      return;
    }

    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target === element && !completedRef.current) {
        completedRef.current = true;
        setDelay(0);
        element.removeEventListener('transitionend', handleTransitionEnd);
      }
    };

    element.addEventListener('transitionend', handleTransitionEnd);

    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [index]);

  return (
    <li
      ref={itemRef}
      className={twMerge(
        'flex translate-y-0 items-start gap-4 rounded-2xl border-l-4 bg-amber-50 p-5 opacity-100 shadow-md transition-all duration-500 ease-out dark:bg-slate-800 dark:shadow-lg starting:translate-y-4 starting:opacity-0',
        checked
          ? 'translate-x-2 border-l-emerald-500 opacity-60'
          : 'translate-x-0 border-l-rose-400',
      )}
      style={{
        transitionDelay: `${delay}ms`,
      }}
      onClick={onToggle}
    >
      <button
        className={twMerge(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          checked
            ? 'scale-110 border-emerald-500 bg-emerald-500 shadow-md'
            : 'border-stone-400 bg-white dark:border-stone-600 dark:bg-slate-700',
        )}
      >
        {checked && (
          <svg
            className="h-4 w-4 scale-100 text-white transition-transform duration-200"
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
      <p
        className={twMerge(
          'flex-1 transition-all select-none',
          checked
            ? 'text-stone-500 line-through dark:text-stone-500'
            : 'text-stone-700 dark:text-stone-200',
        )}
      >
        {point}
      </p>
    </li>
  );
}

type BulletPointsListProps = {
  points: string[];
  checkedStates: boolean[];
  onToggleAction: (index: number) => void;
  ref?: React.Ref<HTMLUListElement>;
};

export function BulletPointsList({
  points,
  checkedStates,
  onToggleAction,
  ref,
}: BulletPointsListProps) {
  return (
    <ul ref={ref} className="w-full max-w-4xl space-y-4">
      {points.map((point, index) => (
        <BulletPointItem
          key={index}
          checked={checkedStates[index]}
          index={index}
          onToggle={() => onToggleAction(index)}
        >
          {point}
        </BulletPointItem>
      ))}
    </ul>
  );
}
