import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = {};

    if (session.user.role === "BUYER") {
      where.userId = session.user.id;
    } else if (session.user.role === "DISTRIBUTOR") {
      where.items = {
        some: { distributorId: session.user.distributorId },
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
            distributor: { select: { companyName: true } },
          },
        },
        shippingAddress: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, shippingAddressId } = await request.json();

    if (!items?.length || !shippingAddressId) {
      return NextResponse.json(
        { error: "Items and shipping address are required" },
        { status: 400 }
      );
    }

    // Fetch products to calculate prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products are unavailable" },
        { status: 400 }
      );
    }

    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: product.id,
        distributorId: product.distributorId,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const tax = subtotal * 0.08; // 8% tax placeholder
    const shippingCost = 0; // Free shipping placeholder
    const total = subtotal + tax + shippingCost;

    const orderNumber = `DP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        shippingAddressId,
        subtotal,
        tax,
        shippingCost,
        total,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
