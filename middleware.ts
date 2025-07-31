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

  const PUBLIC_ROUTES = ['/', '/login', '/register', '/search-product', '/product-details', '/api/public'];
  const ADMIN_ROUTES = ['/admin-panel', '/admin', '/api/admin'];
  const GENERAL_ROUTES = ['/account', '/cart', '/orders', '/customer-dashboard', '/api/dashboard/customer'];

  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  const decoded = await verifyJWT(token);
  if (!decoded?.id || !decoded?.role) return NextResponse.redirect(new URL('/login', req.url));
console.log("Decoded token:", decoded);
console.log("Decoded Middleware Token:", decoded);

  const role = (decoded.role as string).toLowerCase();

  // Admin-only pages
  if (ADMIN_ROUTES.some((p) => pathname.startsWith(p)) && role !== ROLE.ADMIN) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // General-user pages (must be general or admin)
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
    '/api/:path*',
  ],
};
