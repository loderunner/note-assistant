'use client';

import { useVideoPlayer } from '../video-player-context';

export default function ContentSlot() {
  const { skipToEnd, playerReady } = useVideoPlayer();

  return (
    <div className="flex translate-y-0 flex-col items-center gap-2 opacity-100 transition-all delay-300 duration-300">
      <p className="text-center text-lg text-gray-700 dark:text-gray-300">
        Regardez la vidéo et prenez des notes
      </p>
      {playerReady && skipToEnd !== null && (
        <button
          aria-label="Aller à la fin de la vidéo"
          className="text-sm text-gray-600 underline transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          type="button"
          onClick={skipToEnd}
        >
          Aller à la fin
        </button>
      )}
    </div>
  );
}
