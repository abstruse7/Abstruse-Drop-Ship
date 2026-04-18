import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PAYPAL_BASE, getPayPalAccessToken } from "@/lib/paypal";

// POST /api/checkout — Create a PayPal order
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

    // Verify products exist and get current prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { distributor: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Some products are unavailable" },
        { status: 400 }
      );
    }

    // Check stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const purchaseItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        name: product.name,
        quantity: String(item.quantity),
        unit_amount: {
          currency_code: "USD",
          value: product.price.toFixed(2),
        },
      };
    });

    const subtotal = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + product.price * item.quantity;
    }, 0);

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

    // Create PayPal order
    const accessToken = await getPayPalAccessToken();

    const paypalRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            items: purchaseItems,
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: subtotal.toFixed(2),
                },
                tax_total: {
                  currency_code: "USD",
                  value: tax.toFixed(2),
                },
                shipping: {
                  currency_code: "USD",
                  value: shippingCost.toFixed(2),
                },
              },
            },
          },
        ],
      }),
    });

    const paypalOrder = await paypalRes.json();

    if (!paypalRes.ok) {
      console.error("PayPal order creation failed:", paypalOrder);
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ orderID: paypalOrder.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
