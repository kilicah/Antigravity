import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login', '/api/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('yuppi_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const verifiedToken = await verifyToken(token);

  if (!verifiedToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('yuppi_session');
    return response;
  }

  if (pathname.startsWith('/admin') && verifiedToken.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', verifiedToken.id.toString());
  requestHeaders.set('x-user-role', verifiedToken.role);
  requestHeaders.set('x-user-username', verifiedToken.username);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api/login|_next/static|_next/image|favicon.ico).*)'],
}
