import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const [users, distributorCount, products, orders, distributors] =
      await Promise.all([
        prisma.user.count(),
        prisma.distributor.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.distributor.findMany({
          include: { _count: { select: { products: true } } },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    return NextResponse.json({
      stats: {
        users,
        distributors: distributorCount,
        products,
        orders,
      },
      distributors,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
