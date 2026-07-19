import { NextResponse } from "next/server";
import * as TicketController from "@/features/tickets/ticket.controller";
import * as TicketService from "@/features/tickets/ticket.service";
import { verifyAccessToken } from "@/features/authentification/auth.jwt";

async function getUser(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("access_token=")[1]
    ?.split(";")[0];
  if (!token) {
    throw new Error("Non authentifié");
  }
  return verifyAccessToken(token);
}
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await getUser(request);

    const { id } = await params;

    const ticket = await TicketService.getById(Number(id), user.idUser);

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status: 403,
      },
    );
  }
}
export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await getUser(request);
    const { id } = await params;
    const body = await request.json();
    const ticket = await TicketController.update(Number(id), body, user.idUser);
    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status: 403,
      },
    );
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const user = await getUser(request);
    const { id } = await params;
    await TicketService.remove(Number(id), user.idUser);
    return NextResponse.json({
      message: "Ticket supprimé",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Erreur serveur",
      },
      {
        status: 403,
      },
    );
  }
}
