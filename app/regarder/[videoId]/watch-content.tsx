'use client';

import { motion } from 'motion/react';

import { VideoPlayer } from './video-player';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, y: -50 },
};

type WatchContentProps = {
  videoId: string;
};

export function WatchContent({ videoId }: WatchContentProps) {
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
        className="mb-8 text-center text-[46px] font-bold text-black dark:text-zinc-50"
        initial={{ scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        Notix
      </motion.h1>
      <VideoPlayer videoId={videoId} />
    </motion.main>
  );
}
