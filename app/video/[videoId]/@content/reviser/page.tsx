import { ReviewContent } from '../../reviser/review-content';
import { ReviewData } from '../../reviser/review-data';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { videoId } = await params;

  return (
    <ReviewContent>
      <ReviewData videoId={videoId} />
    </ReviewContent>
  );
}
