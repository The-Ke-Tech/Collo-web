import { db } from "@/common/lib/db";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");
    const shipping = searchParams.get("shipping"); // optional shipping filter
    const search = searchParams.get("q"); // optional search

    // --- Upper Table: Only CONFIRMED orders ---
    const confirmedWhere: Prisma.OrderWhereInput = {
      paymentStatus: "CONFIRMED",
    };

    if (shipping) {
      confirmedWhere.shippingStage = shipping as Prisma.OrderWhereInput["shippingStage"];
    }

    if (search) {
      confirmedWhere.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const totalOrders = await db.order.count({ where: confirmedWhere });

    const confirmedOrders = await db.order.findMany({
      where: confirmedWhere,
      include: {
        user: { select: { id: true, name: true, email: true } },
        productDetails: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // --- Lower Table: All Orders ---
    const allOrders = await db.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        productDetails: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      confirmedOrders,
      allOrders,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
