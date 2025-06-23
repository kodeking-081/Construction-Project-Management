// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Must be a Uint8Array
const encoder = new TextEncoder();
const secret = encoder.encode(SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    console.log('[middleware] verified payload:', payload);
    return NextResponse.next();
  } catch (err) {
    console.error('[middleware] JWT verification failed:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/user/:path*'],
};
