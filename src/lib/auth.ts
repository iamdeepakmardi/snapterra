import jwt from "jsonwebtoken";
import { headers, cookies } from "next/headers";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
};

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, getSecret()) as { id: number };
    return decoded.id;
  } catch (error) {
    return null;
  }
};

export const getUserIdFromRequest = async () => {
  // Check cookie first (for frontend requests)
  const cookieStore = await cookies();
  const token = cookieStore.get("snapterra_token")?.value;

  if (token) {
    return verifyToken(token);
  }

  // Fallback to Authorization header (for API/Mobile requests)
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  const bearerToken = authHeader?.split(" ")[1];

  if (bearerToken) {
    return verifyToken(bearerToken);
  }

  return null;
};

export const createToken = (userId: number) => {
  return jwt.sign({ id: userId }, getSecret(), { expiresIn: "30d" });
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set("snapterra_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
};

export const removeAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("snapterra_token");
};
