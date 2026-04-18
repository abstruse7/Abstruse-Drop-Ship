import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PATCH /api/distributor/orders/[itemId] — Update order item status/tracking
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "DISTRIBUTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await params;
    const { status, trackingNumber, trackingUrl } = await request.json();

    // Verify this order item belongs to the distributor
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: { order: true },
    });

    if (!orderItem || orderItem.distributorId !== session.user.distributorId) {
      return NextResponse.json({ error: "Order item not found" }, { status: 404 });
    }

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Update the order item
    const updateData = {};
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;

    const updated = await prisma.orderItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        product: { select: { name: true } },
        order: true,
      },
    });

    // If all items in the order have the same status, update the order status too
    if (status) {
      const allItems = await prisma.orderItem.findMany({
        where: { orderId: orderItem.orderId },
      });

      const allSameStatus = allItems.every((item) =>
        item.id === itemId ? status === status : item.status === status
      );

      if (allSameStatus) {
        await prisma.order.update({
          where: { id: orderItem.orderId },
          data: { status },
        });
      }
    }

    return NextResponse.json({ orderItem: updated });
  } catch (error) {
    console.error("Order item update error:", error);
    return NextResponse.json(
      { error: "Failed to update order item" },
      { status: 500 }
    );
  }
}
