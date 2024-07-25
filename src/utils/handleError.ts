import { Response } from "express";

export const handleErr = (res: Response, code: any, error: any) => {
  console.error(error);
  res.status(code).json({ error: error.message || "Internal error" });
};

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
