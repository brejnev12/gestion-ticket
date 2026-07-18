import { findUserByEmail, createUser } from "./auth.repository";
import { hashPassword, comparePassword } from "./auth.security";
import { Register, Login } from "./auth.type";

export async function register(data: Register) {
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new Error("Email déjà utilisé");
  }
  const password = await hashPassword(data.password);
  return createUser({
    ...data,
    password,
  });
}

export async function login(data: Login) {
  const user = await findUserByEmail(data.email);
  if (!user) {
    throw new Error("Identifiants incorrects");
  }
  const validPassword = await comparePassword(data.password, user.password);
  if (!validPassword) {
    throw new Error("Identifiants incorrects");
  }
  return user;
}
