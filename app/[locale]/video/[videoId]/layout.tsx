import type { ReactNode } from 'react';

import { VideoPlayerProvider } from './video-player-context';

import { Link } from '@/i18n/navigation';

type VideoLayoutProps = {
  /** Video player slot */
  video: ReactNode;
  /** Content slot */
  content: ReactNode;
};

/**
 * Layout for video pages.
 * Provides the video player context and renders the video and content slots.
 */
export default function VideoLayout({ video, content }: VideoLayoutProps) {
  return (
    <VideoPlayerProvider>
      <main className="flex min-h-screen flex-col items-center bg-linear-to-br from-amber-50 to-orange-50 px-4 py-8 opacity-100 transition-opacity duration-300 dark:from-slate-900 dark:to-slate-950 starting:opacity-0">
        <Link href="/">
          <h1 className="mb-8 -translate-y-5 scale-[0.8] cursor-pointer bg-linear-to-r from-rose-500 to-teal-500 bg-clip-text text-center text-5xl font-bold text-transparent opacity-100 transition-all duration-400 hover:opacity-80 dark:from-rose-400 dark:to-teal-400 starting:translate-y-0 starting:scale-100 starting:opacity-0">
            Notix
          </h1>
        </Link>
        <div className="mb-8 flex w-full justify-center">{video}</div>
        {content}
      </main>
    </VideoPlayerProvider>
  );
}
