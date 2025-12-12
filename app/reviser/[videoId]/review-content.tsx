'use client';

import { motion } from 'motion/react';
import { type ReactNode } from 'react';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

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
    <motion.main
      animate="animate"
      className="flex min-h-screen flex-col items-center bg-white px-4 py-8 dark:bg-black"
      exit="exit"
      initial="initial"
      transition={{ duration: 0.3 }}
      variants={pageVariants}
    >
      <motion.h1
        animate={{ scale: 0.8, y: -20 }}
        className="mb-8 text-center text-2xl font-semibold text-black dark:text-zinc-50"
        initial={{ scale: 0.8, y: -20 }}
      >
        Notix
      </motion.h1>

      <div className="mb-6 w-full max-w-4xl">
        <div className="mb-4 h-px bg-gray-300 dark:bg-gray-700" />
        <div className="ml-auto w-fit rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          Vidéo
        </div>
      </div>

      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center text-lg text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
      >
        Comparez vos notes et vérifiez que vous avez bien tous les points
        importants
      </motion.p>

      {children}
    </motion.main>
  );
}
