import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id: userId } = await params;
    const { profilePic } = await req.json();

    if (!profilePic) {
      return NextResponse.json(
        { success: false, message: "profilePic is required" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { profilePic },
    });

    return NextResponse.json({
      success: true,
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("🔥 Error updating avatar:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update avatar" },
      { status: 500 }
    );
  }
}
