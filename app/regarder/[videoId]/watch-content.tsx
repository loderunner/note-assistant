'use client';

import { useEffect, useState } from 'react';

import { VideoPlayer } from './video-player';

type WatchContentProps = {
  videoId: string;
};

export function WatchContent({ videoId }: WatchContentProps) {
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
      <h1
        className={`mb-8 text-center text-[46px] font-bold text-black transition-all duration-400 dark:text-zinc-50 ${
          mounted ? 'scale-[0.8] -translate-y-5' : 'scale-100 translate-y-0'
        }`}
      >
        Notix
      </h1>
      <VideoPlayer videoId={videoId} />
    </main>
  );
}
