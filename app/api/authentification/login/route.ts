import { NextResponse } from "next/server";
import { login } from "@/features/authentification/auth.controller";
import { RateLimit } from "@/features/authentification/auth.rate-limit";
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    RateLimit(`login-${ip}`);
    const body = await request.json();
    const response = NextResponse.json({
      message: "Connexion réussie",
    });
    const data = await login(body, response.cookies);
    return NextResponse.json(data, {
      status: 200,
      headers: response.headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status:
          error instanceof Error && error.message.includes("Trop de tentatives")
            ? 429
            : 401,
      },
    );
  }
}
