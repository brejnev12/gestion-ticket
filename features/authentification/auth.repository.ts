import prisma from "@/lib/prisma";
import { Register } from "./auth.type";

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}
export async function createUser(
  data: Register & {
    password: string;
  },
) {
  return prisma.user.create({
    data: {
      name: data.nom,
      email: data.email,
      password: data.password,
    },
  });
}
