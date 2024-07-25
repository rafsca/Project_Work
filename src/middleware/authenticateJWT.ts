import express, { Request, Response, NextFunction } from "express";
import { JwtPayload, sign, verify } from "jsonwebtoken";
import "dotenv/config";

export interface CustomRequest extends Request {
  user?: string | object;
}

const verifyToken = (token: string) => {
  try {
    const decode = verify(token, String(process.env.JWT_KEY));
    return decode as JwtPayload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  const decode = verifyToken(token);
  if (!decode) return res.status(400).json({ error: "Invalid Token" });

  req.user = decode;
  next();
};
