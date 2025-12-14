import { WatchContent } from './watch-content';

type PageProps = {
  params: Promise<{ videoId: string }>;
};

export default async function WatchPage({ params }: PageProps) {
  const { videoId } = await params;

  return <WatchContent videoId={videoId} />;
}
