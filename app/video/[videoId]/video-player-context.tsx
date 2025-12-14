'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

type VideoPlayerContextValue = {
  skipToEnd: (() => void) | null;
  playerReady: boolean;
  setSkipToEnd: (fn: (() => void) | null) => void;
  setPlayerReady: (ready: boolean) => void;
};

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function VideoPlayerProvider({ children }: { children: ReactNode }) {
  const [skipToEnd, setSkipToEnd] = useState<(() => void) | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  return (
    <VideoPlayerContext
      value={{ skipToEnd, playerReady, setSkipToEnd, setPlayerReady }}
    >
      {children}
    </VideoPlayerContext>
  );
}

export function useVideoPlayer() {
  const context = useContext(VideoPlayerContext);
  if (context === null) {
    throw new Error('useVideoPlayer must be used within VideoPlayerProvider');
  }
  return context;
}
