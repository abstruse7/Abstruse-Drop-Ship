import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PAYPAL_BASE, getPayPalAccessToken } from "@/lib/paypal";

// POST /api/checkout/capture — Capture PayPal payment and create order
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderID, items, shippingAddressId } = await request.json();

    if (!orderID || !items?.length || !shippingAddressId) {
      return NextResponse.json(
        { error: "Order ID, items, and shipping address are required" },
        { status: 400 }
      );
    }

    // Capture the PayPal payment
    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED") {
      console.error("PayPal capture failed:", captureData);
      return NextResponse.json(
        { error: "Payment capture failed" },
        { status: 400 }
      );
    }

    // Get product details for order
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

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

    // Calculate weight-based shipping
    let totalWeight = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      totalWeight += (product.weight || 1) * item.quantity;
    }

    const FREE_SHIPPING_THRESHOLD = 75;
    const SHIPPING_RATES = [
      { maxWeight: 1, rate: 5.99 },
      { maxWeight: 5, rate: 8.99 },
      { maxWeight: 10, rate: 12.99 },
      { maxWeight: 25, rate: 18.99 },
      { maxWeight: 50, rate: 24.99 },
      { maxWeight: Infinity, rate: 34.99 },
    ];

    let shippingCost = 0;
    if (subtotal < FREE_SHIPPING_THRESHOLD) {
      const tier = SHIPPING_RATES.find((t) => totalWeight <= t.maxWeight);
      shippingCost = tier.rate;
    }

    const tax = subtotal * 0.08;
    const total = subtotal + shippingCost + tax;
    const orderNumber = `DP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        shippingAddressId,
        subtotal,
        tax,
        shippingCost,
        total,
        paymentId: orderID,
        items: { create: orderItems },
      },
    });

    // Decrease stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    console.log("Order created:", orderNumber);

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json(
      { error: "Failed to capture payment" },
      { status: 500 }
    );
  }
}
