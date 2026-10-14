import type { Metadata } from 'next';
import config from '@/content/frame.json';
import { getFrameVersion } from '@/app/lib/frame';
import FrameSlideshow from './FrameSlideshow';
import { resolveSlides, type FrameItem } from './slides';

export const metadata: Metadata = {
  title: 'Frame',
  robots: { index: false, follow: false },
};

// Teamup-Daten wie auf der Startseite alle 15 Minuten neu holen
export const revalidate = 900;

export default async function FramePage() {
  const slides = await resolveSlides(config.items as FrameItem[]);
  return (
    <FrameSlideshow
      items={slides}
      defaultDuration={config.defaultDuration}
      version={getFrameVersion()}
    />
  );
}
