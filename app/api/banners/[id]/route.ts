import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

// ✅ Get single banner by id
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const banner = await db.banner.findUnique({ where: { id } });

    if (!banner) {
      return NextResponse.json(
        { success: false, message: "Banner not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("🔥 Error fetching banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

// ✅ Update banner
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { imageUrl, position } = body;

    const updatedBanner = await db.banner.update({
      where: { id },
      data: {
        ...(imageUrl && { imageUrl }),
        ...(position && { position }),
      },
    });

    return NextResponse.json({ success: true, data: updatedBanner });
  } catch (error) {
    console.error("🔥 Error updating banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// ✅ Delete banner
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    await db.banner.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Error deleting banner:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
