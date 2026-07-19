import { updateUserValidate } from "./users.validate";
import * as UserService from "./users.service";

export async function getAll() {
  return UserService.getAll();
}
export async function getById(id: number) {
  return UserService.getById(id);
}
export async function update(id: number, body: unknown) {
  const data = updateUserValidate.parse(body);
  return UserService.update(id, data);
}
export async function remove(id: number) {
  return UserService.remove(id);
}
