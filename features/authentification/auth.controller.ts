import {registerValidate,loginValidate,} from "@/features/authentification/auth.validate";
import * as AuthService from "./auth.service";
import { toUserResponse } from "./auth.mapper";
import { createAccessToken, createRefreshToken } from "./auth.jwt";
import { setAuthCookies } from "./auth.cookie";
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

export async function register(body: unknown) {
  const data = registerValidate.parse(body);
  const user = await AuthService.register(data);
  return {
    user: toUserResponse(user),
  };
}
export async function login(body: unknown, cookies: ResponseCookies) {
  const data = loginValidate.parse(body);
  const user = await AuthService.login(data);
  const accessToken = createAccessToken({
    idUser: user.id,
    role: user.role,
  });
  const refreshToken = createRefreshToken({
    idUser: user.id,
  });
  setAuthCookies(cookies, accessToken, refreshToken);
  return {
    user: toUserResponse(user),
  };
}
