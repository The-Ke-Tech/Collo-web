// pages/api/dashboard/customer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/common/lib/db";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id as string;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, profilePic: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Fetch orders
    const orders = await db.order.findMany({
      where: { userId },
      include: { productDetails: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Filter confirmed orders
    const confirmedOrders = orders.filter(order => order.paymentStatus === "CONFIRMED");

    // Compute stats
    const totalSpent = confirmedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = confirmedOrders.length;

    // Active orders (only confirmed & not delivered/cancelled)
    const activeOrders = confirmedOrders
      .filter(order => !["DELIVERED", "CANCELLED"].includes(order.shippingStage))
      .map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        shippingStage: order.shippingStage,
        items: order.productDetails.map(p => ({
          name: p.product.productName,
          qty: p.quantity,
        })),
      }));

    // Return response

    return NextResponse.json({
      user,
      stats: { totalSpent, totalOrders, activeOrders: activeOrders.length },
      orders,
      activeOrders,
    });
  } catch (error) {
    console.error("[CUSTOMER_DASHBOARD_ERROR]", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
