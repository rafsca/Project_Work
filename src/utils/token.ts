import { JwtPayload, sign, verify } from "jsonwebtoken";
import "dotenv/config";

export const verifyToken = (token: string) => {
  try {
    const decode = verify(token, String(process.env.JWT_KEY));
    return decode as JwtPayload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
