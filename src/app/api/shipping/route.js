import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Shipping rate tiers based on total weight (lbs)
// These can be adjusted or moved to DB later
const SHIPPING_RATES = [
  { maxWeight: 1, rate: 5.99 },
  { maxWeight: 5, rate: 8.99 },
  { maxWeight: 10, rate: 12.99 },
  { maxWeight: 25, rate: 18.99 },
  { maxWeight: 50, rate: 24.99 },
  { maxWeight: Infinity, rate: 34.99 },
];

const FREE_SHIPPING_THRESHOLD = 75; // Free shipping on orders over $75

function calculateShippingRate(totalWeight, subtotal) {
  // Free shipping for orders over threshold
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { cost: 0, method: "Free Shipping", estimatedDays: "5-7 business days" };
  }

  const tier = SHIPPING_RATES.find((t) => totalWeight <= t.maxWeight);
  return {
    cost: tier.rate,
    method: "Standard Shipping",
    estimatedDays: "5-7 business days",
  };
}

// POST /api/shipping — Calculate shipping for a cart
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items } = await request.json();

    if (!items?.length) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

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

    let totalWeight = 0;
    let subtotal = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      totalWeight += (product.weight || 1) * item.quantity; // default 1 lb if no weight
      subtotal += product.price * item.quantity;
    }

    const shipping = calculateShippingRate(totalWeight, subtotal);

    return NextResponse.json({
      shipping,
      totalWeight: Math.round(totalWeight * 100) / 100,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      amountUntilFreeShipping:
        subtotal < FREE_SHIPPING_THRESHOLD
          ? Math.round((FREE_SHIPPING_THRESHOLD - subtotal) * 100) / 100
          : 0,
    });
  } catch (error) {
    console.error("Shipping calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate shipping" },
      { status: 500 }
    );
  }
}
