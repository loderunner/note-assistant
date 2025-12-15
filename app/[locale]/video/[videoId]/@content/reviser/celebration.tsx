'use client';

import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

type CelebrationProps = {
  /** Whether to trigger the celebration effect */
  trigger: boolean;
};

/**
 * Celebration effect component that triggers confetti and sound when completion reaches 100%.
 * Only triggers once per mount.
 */
export function Celebration({ trigger }: CelebrationProps) {
  const hasTriggeredRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!trigger || hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;

    const colors = [
      '#10b981',
      '#34d399',
      '#fbbf24',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
    ];

    // Initial star burst from bottom center
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.8 },
      shapes: ['star'],
      colors,
    });

    // Big emoji burst from center
    confetti({
      particleCount: 150,
      spread: 200,
      origin: { x: 0.5, y: 0.5 },
      shapes: [confetti.shapeFromText({ text: '💯', scalar: 3 })],
      scalar: 3,
    });

    // Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 45,
        spread: 50,
        origin: { x: 0.2, y: 0.6 },
        colors,
      });
    }, 100);

    // Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 135,
        spread: 50,
        origin: { x: 0.8, y: 0.6 },
        colors,
      });
    }, 150);

    // Top center burst
    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 90,
        spread: 65,
        origin: { x: 0.5, y: 0.2 },
        colors,
      });
    }, 200);

    // Center explosion - multiple angles
    setTimeout(() => {
      for (let angle = 0; angle < 360; angle += 30) {
        confetti({
          particleCount: 15,
          angle,
          spread: 25,
          origin: { x: 0.5, y: 0.5 },
          colors,
        });
      }
      // More stars from center
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { x: 0.5, y: 0.5 },
        shapes: ['star'],
        colors,
      });
    }, 300);

    // Final bursts from corners
    setTimeout(() => {
      // Top left
      confetti({
        particleCount: 40,
        angle: 45,
        spread: 40,
        origin: { x: 0.1, y: 0.1 },
        colors,
      });
      // Top right
      confetti({
        particleCount: 40,
        angle: 135,
        spread: 40,
        origin: { x: 0.9, y: 0.1 },
        colors,
      });
      // Bottom left
      confetti({
        particleCount: 40,
        angle: 315,
        spread: 40,
        origin: { x: 0.1, y: 0.9 },
        colors,
      });
      // Bottom right
      confetti({
        particleCount: 40,
        angle: 225,
        spread: 40,
        origin: { x: 0.9, y: 0.9 },
        colors,
      });
      // More shapes from corners
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.1, y: 0.1 },
        shapes: ['star', 'circle'],
        colors,
      });
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.9, y: 0.1 },
        shapes: ['star', 'circle'],
        colors,
      });
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.1, y: 0.9 },
        shapes: ['star', 'circle'],
        colors,
      });
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x: 0.9, y: 0.9 },
        shapes: ['star', 'circle'],
        colors,
      });
    }, 450);

    // Play celebration sound
    try {
      const audio = new Audio('/sounds/celebration.mp3');
      audioRef.current = audio;
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.warn('Could not play celebration sound:', error);
      });
    } catch (error) {
      console.warn('Could not create audio element:', error);
    }
  }, [trigger]);

  return null;
}
