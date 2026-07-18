import { NextResponse } from "next/server";
import { register } from "@/features/authentification/auth.controller";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await register(body);
    return NextResponse.json(user, {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status: 400,
      },
    );
  }
}
