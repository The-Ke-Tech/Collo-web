// /app/api/auth/refresh-token/route.ts
import { db } from "@/common/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY || "fallback_secret");

async function generateToken(userId: string, role: string) {
  return await new SignJWT({ id: userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "No token found" }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    if (!payload?.id) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: payload.id as string } });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const newToken = await generateToken(user.id, (user.role ?? "general").toLowerCase());

    const res = NextResponse.json({ success: true, message: "Token refreshed" });
    res.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
