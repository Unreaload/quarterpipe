import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const expected = process.env.MEMBER_PASSWORD;
  const cookie = req.cookies.get('qp_member')?.value;

  if (!expected || cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = '/mitglieder/login';
    url.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/mitglieder'],
};
