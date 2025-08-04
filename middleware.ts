import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import ROLE from './common/role';

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // PUBLIC ROUTES (No Auth Needed)
  const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/search-product',
    '/product-details',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh-token',
    '/api/public',
    '/api/webhook',
    '/api/search-product',
    '/api/product-details',
  ];

  // If route is public, skip authentication
  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check token for private routes
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  const decoded = await verifyJWT(token);
  if (!decoded?.id || !decoded?.role) return NextResponse.redirect(new URL('/login', req.url));

  const role = typeof decoded.role === 'string' ? decoded.role.toLowerCase() : '';

  // Admin-only routes
  if (pathname.startsWith('/admin') && role !== ROLE.ADMIN) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // General-user routes
  const GENERAL_ROUTES = ['/account', '/cart', '/orders', '/customer-dashboard'];
  if (GENERAL_ROUTES.some((p) => pathname.startsWith(p)) && ![ROLE.GENERAL, ROLE.ADMIN].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-panel/:path*',
    '/account/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/customer-dashboard/:path*',
    '/api/dashboard/:path*',   // only protect dashboard APIs
    '/api/admin/:path*',       // only protect admin APIs
  ],
};
