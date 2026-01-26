import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/privacy', '/cookies'];
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // Redirect to login if not authenticated and trying to access protected route
  if (!user && !isPublicRoute && path !== '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to /app if authenticated and trying to access login
  if (user && path === '/login') {
    const appUrl = new URL('/app', request.url);
    return NextResponse.redirect(appUrl);
  }

  // Redirect to /app if authenticated and on home page
  if (user && path === '/') {
    const appUrl = new URL('/app', request.url);
    return NextResponse.redirect(appUrl);
  }

  // Redirect to login if on home page and not authenticated
  if (!user && path === '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
