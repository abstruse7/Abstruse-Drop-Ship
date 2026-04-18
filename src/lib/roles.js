/**
 * Role hierarchy: OWNER > ADMIN > DISTRIBUTOR > BUYER
 * OWNER has full unrestricted access to the entire platform.
 */

export function isOwner(session) {
  return session?.user?.role === "OWNER";
}

export function isAdminOrOwner(session) {
  return session?.user?.role === "OWNER" || session?.user?.role === "ADMIN";
}

export function requireOwner(session) {
  if (!session || session.user.role !== "OWNER") {
    return { authorized: false, error: "Owner access required" };
  }
  return { authorized: true };
}

export function requireAdmin(session) {
  if (!session || !isAdminOrOwner(session)) {
    return { authorized: false, error: "Admin access required" };
  }
  return { authorized: true };
}
