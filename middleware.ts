// middleware.ts
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

  const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/search-product',
    '/product-details',
    '/api/public',
    '/api/webhook',
    '/api/search-product',
    '/api/product-details',
    '/api/auth/refresh-token'
  ];
  const ADMIN_ROUTES = ['/admin-panel', '/admin', '/api/admin'];
  const GENERAL_ROUTES = ['/account', '/cart', '/orders', '/customer-dashboard', '/api/dashboard/customer'];

  // Public routes bypass authentication
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_ROUTES.some((p) => pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Require token for everything else
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  const decoded = await verifyJWT(token);
  if (!decoded?.id || !decoded?.role) return NextResponse.redirect(new URL('/login', req.url));

  const role = typeof decoded.role === 'string' ? decoded.role.toLowerCase() : '';

  // Admin-only pages
  if (ADMIN_ROUTES.some((p) => pathname.startsWith(p)) && role !== ROLE.ADMIN) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // General-user pages
  if (GENERAL_ROUTES.some((p) => pathname.startsWith(p)) && ![ROLE.GENERAL, ROLE.ADMIN].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-panel/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/customer-dashboard/:path*',
    '/api/auth/refresh-token',
    '/api/:path*',
  ],
};
