'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { extractVideoId } from './youtube/validate-url';

type UrlInputState = 'idle' | 'validating' | 'error';

export function UrlInput() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<UrlInputState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
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
        setShowError(false);
      }, 0);
      return;
    }

    const videoId = extractVideoId(trimmedUrl);

    if (videoId !== null) {
      setTimeout(() => {
        setState('validating');
      }, 0);
      timeoutRef.current = setTimeout(() => {
        router.push(`/video/${videoId}`);
      }, 1000);
    } else {
      timeoutRef.current = setTimeout(() => {
        setState('error');
        setErrorMessage(
          'URL YouTube invalide. Veuillez entrer une URL valide.',
        );
        setShowError(true);
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
        router.push(`/video/${videoId}`);
      }, 1000);
    } else if (trimmedUrl.length > 0) {
      setState('error');
      setErrorMessage('URL YouTube invalide. Veuillez entrer une URL valide.');
      setShowError(true);
    } else {
      setState('idle');
      setErrorMessage('');
      setShowError(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form className="flex flex-col items-center" onSubmit={handleSubmit}>
        <div className="relative w-full">
          <input
            className={twMerge(
              'w-full rounded-lg border-2 px-4 py-3 pr-12 text-lg transition-all',
              state === 'error'
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20 focus:outline-none'
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white',
              state === 'validating' ? 'opacity-70' : 'opacity-100',
            )}
            disabled={state === 'validating'}
            placeholder="https://youtube.com/watch?v=..."
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (state === 'error') {
                setState('idle');
                setErrorMessage('');
                setShowError(false);
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
                <div className="h-5 w-5 scale-100 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 opacity-100 transition-all dark:border-gray-600 dark:border-t-blue-400" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-400 opacity-100 transition-opacity dark:bg-gray-500" />
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex min-h-12 flex-col items-center justify-start">
          {showError && (
            <p className="mb-2 translate-y-0 text-sm text-red-600 opacity-100 transition-all duration-300 dark:text-red-400 starting:translate-y-2 starting:opacity-0">
              {errorMessage}
            </p>
          )}
          <p className="text-center text-sm text-gray-600 opacity-100 transition-opacity delay-200 duration-300 dark:text-gray-400 starting:opacity-0">
            Entrez une URL YouTube
          </p>
        </div>
      </form>
    </div>
  );
}
