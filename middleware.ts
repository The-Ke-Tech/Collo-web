// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import ROLE from './common/role';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/search-product', '/product-details', '/api/public'];
const ADMIN_ROUTES = ['/admin-panel', '/admin', '/api/admin'];
const GENERAL_ROUTES = ['/account', '/api/cart', '/cart', '/orders', '/api/user', '/api/users/me', '/customer-dashboard', '/api/dashboard/customer'];

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

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.id || !decoded.role) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = (decoded.role as string).toLowerCase();

  // Admin-only protection
  if (ADMIN_ROUTES.some(path => pathname.startsWith(path)) && role !== ROLE.ADMIN.toLowerCase()) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  // General-user pages protection
  if (GENERAL_ROUTES.some(path => pathname.startsWith(path)) && ![ROLE.GENERAL.toLowerCase(), ROLE.ADMIN.toLowerCase()].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next(); 
}

export const config = {
  matcher: [
    '/admin-panel',
    '/admin/:path*',
    '/account/:path*',
    '/cart/:path*',
    '/orders/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/users/me',
    '/api/dashboard/customer',
    '/customer-dashboard',
  ],
};
