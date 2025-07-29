import { db } from "@/common/lib/db";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import ROLE from "@/common/role";

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyJWT(token);
    if (!decoded || decoded.role !== ROLE.ADMIN) {
      return NextResponse.json({ success: false, message: "Forbidden: Admins only" }, { status: 403 });
    }

    const { role } = await req.json();
    if (!role) {
      return NextResponse.json({ success: false, message: "Role is required" }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { role },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update role" },
      { status: 500 }
    );
  }
}
