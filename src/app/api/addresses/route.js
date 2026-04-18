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

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Addresses fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
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

    const { label, street, city, state, zip } = await request.json();

    if (!street || !city || !state || !zip) {
      return NextResponse.json(
        { error: "Street, city, state, and zip are required" },
        { status: 400 }
      );
    }

    const address = await prisma.address.create({
      data: {
        label: label || null,
        street,
        city,
        state,
        zip,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("Address creation error:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
