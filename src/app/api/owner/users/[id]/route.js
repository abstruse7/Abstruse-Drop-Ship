import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { requireOwner } from "@/lib/roles";

// PATCH - update user role, status, etc. (OWNER only)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireOwner(session);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Prevent changing the owner's own role
    if (id === session.user.id && body.role && body.role !== "OWNER") {
      return NextResponse.json(
        { error: "Cannot change your own owner role" },
        { status: 403 }
      );
    }

    // Prevent promoting another user to OWNER
    if (body.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot assign OWNER role to another user" },
        { status: 403 }
      );
    }

    const updateData = {};
    if (body.role) updateData.role = body.role;
    if (body.name) updateData.name = body.name;
    if (body.email) updateData.email = body.email;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Owner user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE - remove a user (OWNER only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const auth = requireOwner(session);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;

    // Prevent owner from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 403 }
      );
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Owner user delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
