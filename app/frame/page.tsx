import type { Metadata } from 'next';
import config from '@/content/frame.json';
import { getFrameVersion } from '@/app/lib/frame';
import FrameSlideshow, { type FrameItem } from './FrameSlideshow';

export const metadata: Metadata = {
  title: 'Frame',
  robots: { index: false, follow: false },
};

export default function FramePage() {
  return (
    <FrameSlideshow
      items={config.items as FrameItem[]}
      defaultDuration={config.defaultDuration}
      version={getFrameVersion()}
    />
  );
}
