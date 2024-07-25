import { Request, Response, NextFunction } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import "dotenv/config";

export interface CustomRequest extends Request {
  user?: JwtPayload;
}

const verifyToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, process.env.JWT_KEY!) as JwtPayload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "Missing Token" });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid Token" });

  req.user = decoded;
  next();
};
