import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAccessToken } from "@/features/authentification/auth.jwt";

export async function GET(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("access_token=")[1]
      ?.split(";")[0];
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
    const user = await prisma.user.findUnique({
      where: {
        id: payload.idUser,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Utilisateur introuvable",
        },
        {
          status: 404,
        },
      );
    }
    return NextResponse.json({
      user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status: 401,
      },
    );
  }
}
