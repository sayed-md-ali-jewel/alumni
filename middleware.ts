import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/profile', '/messages', '/dashboard'];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Extract locale and base path without locale
  const segments = pathname.split('/').filter(Boolean);
  const locale = routing.locales.includes(segments[0] as any)
    ? segments[0]
    : routing.defaultLocale;
  const pathWithoutLocale = routing.locales.includes(segments[0] as any)
    ? '/' + segments.slice(1).join('/')
    : pathname;

  const isProtected = protectedRoutes.some(
    (route) => pathWithoutLocale === route || pathWithoutLocale.startsWith(`${route}/`)
  );

  if (isProtected) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || 'super_secret_alumni_jwt_key_2026_bd_app',
    });

    if (!token) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
