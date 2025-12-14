'use client';

import { useEffect, useState, type ReactNode } from 'react';

type ReviewContentProps = {
  /** Content to render in the main area (typically ReviewData wrapped in Suspense) */
  children: ReactNode;
};

/**
 * Client component that provides the animated layout for the review page.
 * Accepts children to allow Server Components to be passed through.
 */
export function ReviewContent({ children }: ReviewContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center bg-white px-4 py-8 transition-opacity duration-300 dark:bg-black ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <h1 className="mb-8 text-center text-2xl font-semibold text-black dark:text-zinc-50 scale-[0.8] -translate-y-5">
        Notix
      </h1>

      <div className="mb-6 w-full max-w-4xl">
        <div className="mb-4 h-px bg-gray-300 dark:bg-gray-700" />
        <div className="ml-auto w-fit rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          Vidéo
        </div>
      </div>

      <p
        className={`mb-8 text-center text-lg text-gray-700 transition-all duration-300 dark:text-gray-300 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        Comparez vos notes et vérifiez que vous avez bien tous les points
        importants
      </p>

      {children}
    </main>
  );
}
