import { getFrameVersion } from '@/app/lib/frame';

export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(
    { version: getFrameVersion() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
