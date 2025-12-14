'use client';

import { useEffect, useState } from 'react';

import { UrlInput } from './url-input';

export function HomeContent() {
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
      className={`relative flex h-screen items-center justify-center bg-white px-4 transition-opacity duration-300 dark:bg-black ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative flex w-full flex-col items-center">
        <h1 className="absolute bottom-full mb-12 text-center text-6xl font-extrabold text-black dark:text-zinc-50 scale-100 translate-y-0">
          Notix
        </h1>
        <UrlInput />
      </div>
    </main>
  );
}
