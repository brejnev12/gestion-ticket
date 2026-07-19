import jwt from "jsonwebtoken";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("Les secrets JWT sont manquants dans le fichier .env");
}

export type AccessTokenPayload = {
  idUser: number;
  role: string;
};
export type RefreshTokenPayload = {
  idUser: number;
};

export function createAccessToken(payload: AccessTokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: "15m",
  });
}
export function createRefreshToken(payload: RefreshTokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "7d",
  });
}
export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, ACCESS_SECRET);
  if (typeof payload === "string") {
    throw new Error("Token invalide");
  }
  return {
    idUser: payload.idUser as number,
    role: payload.role as string,
  };
}
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, REFRESH_SECRET);
  if (typeof payload === "string") {
    throw new Error("Refresh token invalide");
  }
  return {
    idUser: payload.idUser as number,
  };
}
