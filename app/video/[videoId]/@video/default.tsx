import { VideoPlayer } from './video-player';

type VideoDefaultProps = {
  params: Promise<{ videoId: string }>;
};

export default async function VideoDefault({ params }: VideoDefaultProps) {
  const { videoId } = await params;

  return <VideoPlayer videoId={videoId} />;
}
