import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mon_secret_vulnerable";

export function generateToken(userId: number) {
  return jwt.sign({ userId }, SECRET, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
