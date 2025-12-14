import { ReviewContent } from '../../reviser/review-content';
import { ReviewData } from '../../reviser/review-data';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { videoId } = await params;

  return (
    <>
      <p className="mb-8 translate-y-0 text-center text-lg text-gray-700 opacity-100 transition-all delay-200 duration-300 dark:text-gray-300 starting:translate-y-5 starting:opacity-0">
        Comparez vos notes et vérifiez que vous avez bien tous les points
        importants
      </p>
      <ReviewContent>
        <ReviewData videoId={videoId} />
      </ReviewContent>
    </>
  );
}
