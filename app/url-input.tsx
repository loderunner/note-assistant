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
              'w-full rounded-full border-2 bg-white px-6 py-4 pr-14 text-lg shadow-lg transition-all dark:bg-slate-800',
              state === 'error'
                ? 'border-rose-500 focus:border-rose-600 focus:ring-4 focus:ring-rose-500/20 focus:outline-none'
                : 'border-stone-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 focus:outline-none dark:border-slate-600 dark:text-stone-100',
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
            <div className="absolute top-1/2 right-6 flex -translate-y-1/2 items-center gap-1">
              {state === 'validating' ? (
                <>
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-rose-500"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-rose-500"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-rose-500"
                    style={{ animationDelay: '300ms' }}
                  />
                </>
              ) : (
                <div className="h-2 w-2 rounded-full bg-stone-400 opacity-100 transition-opacity dark:bg-stone-500" />
              )}
            </div>
          )}
        </div>
        <div className="mt-6 flex min-h-12 flex-col items-center justify-start">
          {showError && (
            <p className="mb-2 translate-y-0 text-sm text-rose-600 opacity-100 transition-all duration-300 dark:text-rose-400 starting:translate-y-2 starting:opacity-0">
              {errorMessage}
            </p>
          )}
          <p className="text-center text-sm text-stone-600 opacity-100 transition-opacity delay-200 duration-300 dark:text-stone-400 starting:opacity-0">
            Entrez une URL YouTube
          </p>
        </div>
      </form>
    </div>
  );
}
