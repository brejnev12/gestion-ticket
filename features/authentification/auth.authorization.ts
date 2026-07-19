import { Role } from "@/generated/prisma/client";

export function requireRole(currentRole: Role, requiredRole: Role) {
  if (currentRole !== requiredRole) {
    throw new Error("Accès interdit");
  }
}
