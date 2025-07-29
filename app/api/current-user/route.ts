// app/api/current-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/common/lib/db';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Missing token' },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.id as string;

    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        role: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: dbUser });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Invalid token', error: err },
      { status: 403 }
    );
  }
}
