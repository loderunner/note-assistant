'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type VideoPlayerProps = {
  videoId: string;
};

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<{ destroy(): void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initializePlayer = useCallback(() => {
    if (containerRef.current === null || playerRef.current !== null) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (typeof window === 'undefined' || window.YT === undefined) {
      return;
    }

    const containerId = `youtube-player-${videoId}`;
    containerRef.current.id = containerId;

    const yt = window.YT;
    try {
      playerRef.current = new yt.Player(containerId, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          rel: 0,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
            setError(null);
          },
          onError: (event: { data: number }) => {
            console.error('YouTube player error:', event.data);
            setError('Erreur lors du chargement de la vidéo');
          },
          onStateChange: (event: { data: number }) => {
            if (event.data === yt.PlayerState.ENDED) {
              router.push(`/video/${videoId}/reviser`);
            }
          },
        },
      });
    } catch (err) {
      console.error('Error initializing YouTube player:', err);
      setError('Impossible de charger la vidéo');
    }
  }, [videoId, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window.YT !== null && window.YT !== undefined) {
      // Use setTimeout to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        initializePlayer();
      }, 0);
      return () => {
        clearTimeout(timeoutId);
      };
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode !== null) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const originalCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (originalCallback !== null && originalCallback !== undefined) {
        originalCallback();
      }
      initializePlayer();
    };

    return () => {
      if (playerRef.current !== null) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
        playerRef.current = null;
      }
      setPlayerReady(false);
    };
  }, [initializePlayer]);

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-6">
      <div className="relative aspect-video w-full">
        <div ref={containerRef} className="absolute inset-0 h-full w-full" />
        {!playerReady && error === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              Chargement de la vidéo...
            </p>
          </div>
        )}
        {error !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
