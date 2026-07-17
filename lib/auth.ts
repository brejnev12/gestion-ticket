import { verifyToken } from "./jwt";

export function getUserFromToken(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return null;
  }
  try {
    return verifyToken(token) as {
      userId: number;
    };
  } catch {
    return null;
  }
}
