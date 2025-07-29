import { db } from "@/common/lib/db";
import { NextResponse } from "next/server";

interface DateFilter {
  gte: Date;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "all"; // daily | weekly | monthly | all

    const now = new Date();
    let dateFilter: { gte?: Date } = {
      gte: new Date(0),    };

    if (range === "daily") {
      dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (range === "weekly") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (range === "monthly") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    const orders = await db.order.findMany({
      where: { paymentStatus: "CONFIRMED", createdAt: dateFilter },
      select: {
        id: true,
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        fullName: true,
        shippingStage: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    // Group revenue by day for chart
    const grouped = orders.reduce((acc: Record<string, number>, order) => {
      const day = order.createdAt.toISOString().split("T")[0];
      acc[day] = (acc[day] || 0) + order.totalAmount;
      return acc;
    }, {});

    const chartData = Object.keys(grouped).map(date => ({
      date,
      revenue: grouped[date],
    }));

    return NextResponse.json({
      success: true,
      totalRevenue,
      orders,
      chartData,
    });
  } catch (error) {
    console.error("Error fetching revenue:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch revenue" }, { status: 500 });
  }
}
