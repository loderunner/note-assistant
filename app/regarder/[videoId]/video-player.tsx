'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type VideoPlayerProps = {
  videoId: string;
};

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string | HTMLElement,
        config: {
          videoId: string;
          width?: string | number;
          height?: string | number;
          playerVars?: {
            autoplay?: number;
            rel?: number;
          };
          events: {
            onStateChange: (event: { data: number }) => void;
            onReady?: (event: { target: YT.Player }) => void;
            onError?: (event: { data: number }) => void;
          };
        },
      ) => YT.Player;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    interface Player {
      destroy(): void;
    }
  }
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const [playerReady, setPlayerReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initializePlayer = useCallback(() => {
    if (!containerRef.current || playerRef.current) {
      return;
    }

    const containerId = `youtube-player-${videoId}`;
    containerRef.current.id = containerId;

    try {
      playerRef.current = new window.YT.Player(containerId, {
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
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              router.push(`/reviser/${videoId}`);
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
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (originalCallback) {
        originalCallback();
      }
      initializePlayer();
    };

    return () => {
      if (playerRef.current) {
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
        {!playerReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-gray-500 dark:text-gray-400">
              Chargement de la vidéo...
            </p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-lg text-gray-700 dark:text-gray-300"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.3 }}
      >
        Regardez la vidéo et prenez des notes
      </motion.p>
    </div>
  );
}
