import { NextResponse } from "next/server";
import * as UserController from "@/features/users/users.controller";
import { verifyAccessToken } from "@/features/authentification/auth.jwt";
import { requireRole } from "@/features/authentification/auth.authorization";
import { Role } from "@/generated/prisma/client";

function getAccessToken(request: Request) {
  return request.headers
    .get("cookie")
    ?.split("access_token=")[1]
    ?.split(";")[0];
}

export async function GET(request: Request) {
  try {
    const token = getAccessToken(request);
    if (!token) {
      return NextResponse.json(
        {
          message: "Non authentifié",
        },
        {
          status: 401,
        },
      );
    }

    const payload = verifyAccessToken(token);
    requireRole(payload.role as Role, Role.ADMIN);
    const users = await UserController.getAll();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status:
          error instanceof Error && error.message === "Accès interdit"
            ? 403
            : 401,
      },
    );
  }
}
