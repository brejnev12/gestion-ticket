import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";

export function setAuthCookies(
  cookies: ResponseCookies,
  accessToken: string,
  refreshToken: string,
) {
  cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 15,
    path: "/",
  });

  cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
