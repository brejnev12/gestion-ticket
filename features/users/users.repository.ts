import prisma from "@/lib/prisma";
import { UpdateUser } from "./users.type";

export async function findUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
export async function findUserById(id: number) {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
export async function updateUser(id: number, data: UpdateUser) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: {
      id,
    },
  });
}
