'use client';

import { motion } from 'motion/react';

type ReviewErrorProps = {
  /** The error message to display */
  message: string;
  /** The video ID for retry actions */
  videoId: string;
};

/**
 * Error state component displayed when bullet point generation fails.
 * Provides options to retry or go back to the home page.
 */
export function ReviewError({ message, videoId }: ReviewErrorProps) {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-md flex-col items-center gap-6 text-center"
      initial={{ opacity: 0, y: 20 }}
    >
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
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>

      <div className="flex gap-4">
        <motion.button
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
        >
          Réessayer
        </motion.button>
        <motion.a
          className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Nouvelle vidéo
        </motion.a>
      </div>
    </motion.div>
  );
}
