'use client';

import Link from 'next/link';

/**
 * Error boundary for the video review page.
 * Catches rendering errors and provides retry functionality.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex w-full max-w-md translate-y-0 flex-col items-center gap-6 text-center opacity-100 transition-all duration-300 starting:translate-y-5 starting:opacity-0">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
          Erreur
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
      </div>

      <div className="flex gap-4">
        <button
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
          onClick={reset}
        >
          Réessayer
        </button>
        <Link
          className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:scale-105 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          href="/"
        >
          Nouvelle vidéo
        </Link>
      </div>
    </div>
  );
}
