import { User } from "@/generated/prisma/client";

export function toUserResponse(user: User) {
  const { password,
     ...data } = user;
  return data;
}
