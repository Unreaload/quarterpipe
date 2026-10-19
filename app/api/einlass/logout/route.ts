import { NextResponse } from 'next/server';
import { DOOR_COOKIE } from '../../../lib/tickets/door';

export async function POST(request: Request) {
  const res = NextResponse.redirect(new URL('/einlass', request.url), 303);
  res.cookies.set(DOOR_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
