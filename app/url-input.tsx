'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useRef, useState } from 'react';

import { extractVideoId } from './youtube/validate-url';

type UrlInputState = 'idle' | 'validating' | 'error';

export function UrlInput() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UrlInputState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    navigateIfValid(url);
  };

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    const trimmedUrl = url.trim();

    if (trimmedUrl.length === 0) {
      setTimeout(() => {
        setState('idle');
        setErrorMessage('');
      }, 0);
      return;
    }

    const videoId = extractVideoId(trimmedUrl);

    if (videoId !== null) {
      setTimeout(() => {
        setState('validating');
      }, 0);
      timeoutRef.current = setTimeout(() => {
        router.push(`/regarder/${videoId}`);
      }, 1000);
    } else {
      timeoutRef.current = setTimeout(() => {
        setState('error');
        setErrorMessage(
          'URL YouTube invalide. Veuillez entrer une URL valide.',
        );
      }, 1000);
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [url, router]);

  const navigateIfValid = (inputUrl: string) => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    const trimmedUrl = inputUrl.trim();
    const videoId = extractVideoId(trimmedUrl);

    if (videoId !== null) {
      setState('validating');
      timeoutRef.current = setTimeout(() => {
        router.push(`/regarder/${videoId}`);
      }, 1000);
    } else if (trimmedUrl.length > 0) {
      setState('error');
      setErrorMessage('URL YouTube invalide. Veuillez entrer une URL valide.');
    } else {
      setState('idle');
      setErrorMessage('');
    }
  };

  const inputVariants = {
    idle: { opacity: 1 },
    error: { opacity: 1 },
    validating: { opacity: 0.7 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="w-full max-w-2xl">
      <form className="flex flex-col items-center" onSubmit={handleSubmit}>
        <div className="relative w-full">
          <motion.input
            animate={state}
            className={`w-full rounded-lg border-2 px-4 py-3 pr-12 text-lg transition-colors ${
              state === 'error'
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 focus:outline-none'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white'
            }`}
            disabled={state === 'validating'}
            placeholder="https://youtube.com/watch?v=..."
            type="text"
            value={url}
            variants={inputVariants}
            onChange={(e) => {
              setUrl(e.target.value);
              if (state === 'error') {
                setState('idle');
                setErrorMessage('');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                navigateIfValid(url);
              }
            }}
          />
          {url.trim().length > 0 && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              {state === 'validating' ? (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                />
              ) : (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"
                  initial={{ opacity: 0 }}
                />
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex min-h-12 flex-col items-center justify-start">
          {state === 'error' && (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 text-sm text-red-600 dark:text-red-400"
              exit={{ opacity: 0, y: -10 }}
              initial={{ opacity: 0, y: -10 }}
            >
              {errorMessage}
            </motion.p>
          )}
          <motion.p
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            Entrez une URL YouTube
          </motion.p>
        </div>
      </form>
    </div>
  );
}
