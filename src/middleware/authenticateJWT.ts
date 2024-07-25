import express, { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";

export interface CustomRequest extends Request {
  user?: string | object;
}

export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  const decode = verifyToken(token);
  if (!decode) return res.status(400).json({ error: "Invalid Token" });

  req.user = decode;
  next();
};
