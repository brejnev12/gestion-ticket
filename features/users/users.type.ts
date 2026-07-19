import { Role } from "@/generated/prisma/client";

export type UpdateUser = {
  name?: string;
  email?: string;
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: Role;
};