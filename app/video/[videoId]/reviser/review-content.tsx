'use client';

import { type ReactNode } from 'react';

type ReviewContentProps = {
  /** Content to render in the main area (typically ReviewData wrapped in Suspense) */
  children: ReactNode;
};

/**
 * Client component that provides the animated layout for the review page.
 * Accepts children to allow Server Components to be passed through.
 */
export function ReviewContent({ children }: ReviewContentProps) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="mb-6 w-full max-w-4xl">
        <div className="mb-4 h-px bg-gray-300 dark:bg-gray-700" />
        <div className="ml-auto w-fit rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          Vidéo
        </div>
      </div>

      <p className="mb-8 translate-y-0 text-center text-lg text-gray-700 opacity-100 transition-all delay-200 duration-300 dark:text-gray-300 starting:translate-y-5 starting:opacity-0">
        Comparez vos notes et vérifiez que vous avez bien tous les points
        importants
      </p>

      <div>{children}</div>
    </div>
  );
}
