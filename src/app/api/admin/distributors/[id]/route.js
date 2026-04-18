import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/roles";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireAdmin(session);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const { isApproved } = await request.json();

    const distributor = await prisma.distributor.update({
      where: { id },
      data: { isApproved },
    });

    return NextResponse.json({ distributor });
  } catch (error) {
    console.error("Distributor update error:", error);
    return NextResponse.json(
      { error: "Failed to update distributor" },
      { status: 500 }
    );
  }
}
