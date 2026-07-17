import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: Number(id),
    },
  });

  if (!ticket) {
    return NextResponse.json(
      {
        message: "Ticket introuvable",
      },
      {
        status: 404,
      },
    );
  }
  return NextResponse.json(ticket);
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { title, description, status } = await request.json();

  const ticket = await prisma.ticket.update({
    where: {
      id: Number(id),
    },
    data: {
      title,
      description,
      status,
    },
  });

  return NextResponse.json(ticket);
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await prisma.ticket.delete({
    where: {
      id: Number(id),
    },
  });

  return NextResponse.json({
    message: "Ticket supprimé",
  });
}
