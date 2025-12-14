'use client';

import Link from 'next/link';

/**
 * Action buttons displayed after reviewing bullet points.
 * Provides options to re-watch the video or start with a new one.
 */
export function ReviewActions() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 flex gap-4">
      <button
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
        onClick={scrollToTop}
      >
        Revoir
      </button>
      <Link
        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:scale-105 hover:bg-gray-50 active:scale-95 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        href="/"
      >
        Nouvelle vidéo
      </Link>
    </div>
  );
}
