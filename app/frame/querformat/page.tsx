import type { Metadata } from 'next';
import config from '@/content/frame.json';
import { getFrameVersion } from '@/app/lib/frame';
import FrameSlideshow from '../FrameSlideshow';
import { resolveSlides, type FrameItem } from '../slides';

// Reserve: dieselbe Playlist wie /frame, im Querformat 16:9
export const metadata: Metadata = {
  title: 'Frame quer',
  robots: { index: false, follow: false },
};

export const revalidate = 900;

export default async function FrameLandscapePage() {
  const slides = await resolveSlides(config.items as FrameItem[]);
  return (
    <FrameSlideshow
      items={slides}
      defaultDuration={config.defaultDuration}
      version={getFrameVersion()}
    />
  );
}
