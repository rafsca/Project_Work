import { Response } from "express";

export const handleErr = (res: Response, code: any, error: any) => {
  console.error(error);
  res.status(code).json({ error: error.message || "Internal error" });
};
