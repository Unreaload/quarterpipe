import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const expected = process.env.MEMBER_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const { password } = await req.json().catch(() => ({ password: '' }));

  if (password !== expected) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('qp_member', expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
