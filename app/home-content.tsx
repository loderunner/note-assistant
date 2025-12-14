'use client';

import { UrlInput } from './url-input';

export function HomeContent() {
  return (
    <main className="relative flex h-screen items-center justify-center bg-white px-4 opacity-100 transition-opacity duration-300 dark:bg-black starting:opacity-0">
      <div className="relative flex w-full flex-col items-center">
        <h1 className="absolute bottom-full mb-12 translate-y-0 scale-100 text-center text-6xl font-extrabold text-black dark:text-zinc-50">
          Notix
        </h1>
        <UrlInput />
      </div>
    </main>
  );
}
