import { generateToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return NextResponse.json(
      { message: "Utilisateur introuvable" },
      { status: 404 },
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { message: "Mot de passe incorrect" },
      { status: 401 },
    );
  }

  const token = generateToken(user.id);
  return NextResponse.json({
    token,
    user,
  });
}
