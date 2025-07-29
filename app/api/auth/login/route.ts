import { db } from "@/common/lib/db";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY!);

async function generateToken(userId: string, role: string) {
  return await new SignJWT({ id: userId, role }) // ✅ include role
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // optional
    .sign(secret);
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password required" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user || !user.password || !(await compare(password, user.password))) {
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = await generateToken(user.id, user.role ?? 'default-role');

  const res = NextResponse.json({
    success: true,
    message: "Login successful",
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ✅ token lasts 7 days
  });

  return res;
}
