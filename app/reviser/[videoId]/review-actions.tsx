'use client';

type ReviewActionsProps = {
  /** The YouTube video ID for the "Revoir" link */
  videoId: string;
};

/**
 * Action buttons displayed after reviewing bullet points.
 * Provides options to re-watch the video or start with a new one.
 */
export function ReviewActions({ videoId }: ReviewActionsProps) {
  return (
    <div className="mt-8 flex gap-4">
      <a
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:scale-105 active:scale-95 hover:bg-blue-700"
        href={`/regarder/${videoId}`}
      >
        Revoir
      </a>
      <a
        className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:scale-105 active:scale-95 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        href="/"
      >
        Nouvelle vidéo
      </a>
    </div>
  );
}
