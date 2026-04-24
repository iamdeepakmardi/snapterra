import jwt from "jsonwebtoken";
import { headers } from "next/headers";

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
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return null;
    }

    return verifyToken(token);
};

export const createToken = (userId: number) => {
  return jwt.sign({ id: userId }, getSecret(), { expiresIn: "30d" });
};
