'use client';

import { type ReactNode } from 'react';

type ReviewContentProps = {
  /** Content to render in the main area (typically ReviewData wrapped in Suspense) */
  children: ReactNode;
};

/**
 * Client component that provides the animated layout for the review page.
 * Accepts children to allow Server Components to be passed through.
 */
export function ReviewContent({ children }: ReviewContentProps) {
  return <div className="flex w-full flex-col items-center">{children}</div>;
}
