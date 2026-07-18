import { NextResponse } from "next/server";
import { login } from "@/features/authentification/auth.controller";

export async function POST(request: Request) {
  try {
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
        status: 401,
      },
    );
  }
}
