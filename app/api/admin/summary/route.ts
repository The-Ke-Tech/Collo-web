// app/api/admin/summary/route.ts
import { NextResponse } from "next/server";
import { db } from "@/common/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "week";

    const now = new Date();
    let startDate = new Date();
    if (timeframe === "day") startDate.setDate(now.getDate() - 1);
    if (timeframe === "week") startDate.setDate(now.getDate() - 7);
    if (timeframe === "month") startDate.setMonth(now.getMonth() - 1);

    const users = await db.user.count();
    const orders = await db.order.count({
      where: { paymentStatus: "CONFIRMED" },
    });
    const products = await db.product.count();
    const revenue = await db.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "CONFIRMED" },
    });

    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { fullName: true, email: true, totalAmount: true, paymentStatus: true, createdAt: true },
    });

    const salesData = await db.$queryRaw<
      { date: string; revenue: number }[]
    >`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM-DD') AS date,
        SUM("totalAmount")::float AS revenue
      FROM "Order"
      WHERE "paymentStatus" = 'CONFIRMED'
      AND "createdAt" >= ${startDate}
      GROUP BY date
      ORDER BY date ASC
    `;

    return NextResponse.json({
      success: true,
      stats: { users, orders, products, revenue: revenue._sum.totalAmount || 0 },
      recentOrders,
      salesData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error fetching dashboard data" }, { status: 500 });
  }
}
