// app/api/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/common/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, profilePic } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        profilePic
      }
    });

    return NextResponse.json({ success: true, message: "User created successfully", data: newUser });

  } catch (err: unknown) {
  if (err instanceof Error) {
    return NextResponse.json({ success: false, message: err.message || "Signup failed" }, { status: 500 });
  } else {
    return NextResponse.json({ success: false, message: "An unknown error occurred" }, { status: 500 });
  }
}
}
