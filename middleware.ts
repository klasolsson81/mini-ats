import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;

  // Auto-detect language based on IP country (only if no locale cookie set)
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  if (!localeCookie) {
    // Vercel provides x-vercel-ip-country header
    const country = request.headers.get('x-vercel-ip-country') || 'SE';
    const autoLocale = country === 'SE' ? 'sv' : 'en';

    // Set the locale cookie in the response
    supabaseResponse.cookies.set('NEXT_LOCALE', autoLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/privacy', '/cookies', '/change-password', '/forgot-password', '/reset-password'];
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
