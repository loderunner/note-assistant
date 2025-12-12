import { processVideo } from './process-video';
import { WatchContent } from './watch-content';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function WatchPage({ params }: PageProps) {
  const { videoId } = await params;

  processVideo(videoId).catch((error) => {
    console.error('Error processing video:', error);
  });

  return <WatchContent videoId={videoId} />;
}
