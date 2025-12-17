import { type ReactNode } from 'react';

type ReviewContentProps = {
  /** Content to render in the main area (typically ReviewData wrapped in Suspense) */
  children: ReactNode;
};

/**
 * Server component that provides the layout wrapper for the review page.
 * Accepts children to allow Server Components to be passed through.
 */
export function ReviewContent({ children }: ReviewContentProps) {
  return <div className="flex w-full flex-col items-center">{children}</div>;
}
