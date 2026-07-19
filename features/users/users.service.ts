import {
  findUsers,
  findUserById,
  updateUser,
  deleteUser,
} from "./users.repository";
import { UpdateUser } from "./users.type";

export async function getAll() {
  return findUsers();
}
export async function getById(id: number) {
  const user = await findUserById(id);
  if (!user) {
    throw new Error("Utilisateur introuvable");
  }
  return user;
}
export async function update(id: number, data: UpdateUser) {
  const user = await findUserById(id);
  if (!user) {
    throw new Error("Utilisateur introuvable");
  }
  return updateUser(id, data);
}
export async function remove(id: number) {
  const user = await findUserById(id);
  if (!user) {
    throw new Error("Utilisateur introuvable");
  }
  return deleteUser(id);
}
