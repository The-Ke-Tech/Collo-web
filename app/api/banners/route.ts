import { NextRequest, NextResponse } from "next/server"
import { db } from "@/common/lib/db"

// ✅ Create a new banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageUrl, position, userId } = body

    if (!imageUrl || !position) {
      return NextResponse.json(
        { success: false, message: "imageUrl and position are required" },
        { status: 400 }
      )
    }

    const newBanner = await db.banner.create({
      data: { imageUrl, position, userId: userId || null },
    })

    return NextResponse.json({ success: true, data: newBanner }, { status: 201 })
  } catch (error: any) {
    console.error("🔥 Error creating banner:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create banner" },
      { status: 500 }
    )
  }
}

// ✅ Get all banners
export async function GET() {
  try {
    const banners = await db.banner.findMany({
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, data: banners })
  } catch (error: any) {
    console.error("🔥 Error fetching banners:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch banners" },
      { status: 500 }
    )
  }
}
