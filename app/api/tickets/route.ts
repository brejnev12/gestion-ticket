import { NextResponse } from "next/server";
import * as TicketController from "@/features/tickets/ticket.controller";
import { verifyAccessToken } from "@/features/authentification/auth.jwt";

export async function POST(request: Request) {
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
    const body = await request.json();
    const ticket = await TicketController.create(body, payload.idUser);
    return NextResponse.json(ticket, {
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
    const tickets = await TicketController.getAll(payload.idUser);
    return NextResponse.json(tickets);
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

