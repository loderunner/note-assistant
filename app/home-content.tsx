'use client';

import { motion } from 'motion/react';

import { UrlInput } from './url-input';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const titleVariants = {
  initial: { scale: 1, y: 0 },
  animate: { scale: 1, y: 0 },
  exit: { scale: 0.8, y: -20 },
};

export function HomeContent() {
  return (
    <motion.main
      animate="animate"
      className="relative flex h-screen items-center justify-center bg-white px-4 dark:bg-black"
      exit="exit"
      initial="initial"
      transition={{ duration: 0.3 }}
      variants={pageVariants}
    >
      <div className="relative flex w-full flex-col items-center">
        <motion.h1
          className="absolute bottom-full mb-12 text-center text-6xl font-extrabold text-black dark:text-zinc-50"
          variants={titleVariants}
        >
          Notix
        </motion.h1>
        <UrlInput />
      </div>
    </motion.main>
  );
}
