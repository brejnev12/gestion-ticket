import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";


export async function POST(request: Request) {
  const user = getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ message: "non authentifié" }, { status: 401 });
  }
  const { title, description } = await request.json();
  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      userId: user.userId,
    },
  });
  return NextResponse.json(ticket);
}

export async function GET(request: Request) {
  const user = getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ message: "non authentifié" }, { status: 401 });
  }
  const tickets = await prisma.ticket.findMany({
    where: {
      userId: user.userId,
    },
  });
  return NextResponse.json(tickets);
}
