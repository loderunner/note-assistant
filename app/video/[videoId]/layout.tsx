import type { ReactNode } from 'react';

type VideoLayoutProps = {
  params: Promise<{ videoId: string }>;
  video: ReactNode;
  content: ReactNode;
};

export default async function VideoLayout({
  video,
  content,
}: VideoLayoutProps) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 py-8 opacity-100 transition-opacity duration-300 dark:bg-black starting:opacity-0">
      <h1 className="mb-8 -translate-y-5 scale-[0.8] text-center text-5xl font-bold text-black opacity-100 transition-all duration-400 dark:text-zinc-50 starting:translate-y-0 starting:scale-100 starting:opacity-0">
        Notix
      </h1>
      <div className="flex w-full justify-center">{video}</div>
      {content}
    </main>
  );
}
