import { Suspense } from 'react';

import { ReviewContent } from './review-content';
import { ReviewData } from './review-data';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <p className="text-gray-600 dark:text-gray-400">
        Génération des points clés...
      </p>
    </div>
  );
}

export default async function ReviewPage({ params }: PageProps) {
  const { videoId } = await params;

  return (
    <ReviewContent>
      <Suspense fallback={<LoadingState />}>
        <ReviewData videoId={videoId} />
      </Suspense>
    </ReviewContent>
  );
}
