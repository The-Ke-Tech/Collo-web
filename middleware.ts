// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import ROLE from './common/role';

const PUBLIC_ROUTES = [
  '/', '/login', '/register', '/search-product', '/product-details',
  '/api/public', '/api/auth'
];
const ADMIN_ROUTES = ['/admin-panel', '/admin', '/api/admin'];
const GENERAL_ROUTES = [
  '/account', '/api/cart', '/cart', '/orders',
  '/api/user', '/api/users/me', '/customer-dashboard', '/api/dashboard/customer'
];

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
  const isApiRequest = pathname.startsWith('/api');

  // Allow public pages & APIs
  if (PUBLIC_ROUTES.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Handle missing token
  if (!token) {
    return isApiRequest
      ? NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', req.url));
  }

  // Verify JWT
  const decoded = await verifyJWT(token);
  if (!decoded || !decoded.id || !decoded.role) {
    return isApiRequest
      ? NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', req.url));
  }

  const role = (decoded.role as string).toLowerCase();

  // Role-based restrictions
  const isAdminRoute = ADMIN_ROUTES.some(path => pathname.startsWith(path));
  const isGeneralRoute = GENERAL_ROUTES.some(path => pathname.startsWith(path));

  if (isAdminRoute && role !== ROLE.ADMIN.toLowerCase()) {
    return isApiRequest
      ? NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
      : NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  if (isGeneralRoute && ![ROLE.GENERAL.toLowerCase(), ROLE.ADMIN.toLowerCase()].includes(role)) {
    return isApiRequest
      ? NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
      : NextResponse.redirect(new URL('/unauthorized', req.url));
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
