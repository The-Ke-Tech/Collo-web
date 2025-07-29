import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { jwtVerify } from 'jose';
import ROLE from '@/common/role';

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, secret);

    const rawRole = payload?.role;
    if (!rawRole || typeof rawRole !== 'string') {
      return NextResponse.json({ success: false, message: 'Invalid token payload' }, { status: 401 });
    }

    const role = rawRole.toLowerCase();

    if (role !== ROLE.ADMIN) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
  }
}
