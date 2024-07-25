import { JwtPayload, sign, verify } from "jsonwebtoken";
import "dotenv/config";

// ! ❌ Da rimuovere , ho aggiunto il middleware src/middleware/jwt
export const verifyToken = (token: string) => {
  try {
    const decode = verify(token, String(process.env.JWT_KEY));
    return decode as JwtPayload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};
