import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { hash, compare, hashSync } from "bcryptjs";
import "dotenv/config";

export const routerUser = express.Router();

routerUser.get("/users", (req: Request, res: Response) => {});

routerUser.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const db = await pool.connect();

    const hashPassword = hashSync(password, 10);
    const userQuery = "INSERT INTO users (name, email , password) VALUES ($1, $2, $3) RETURNING id";
    const userValues = [name, email, hashPassword];
    const result = await db.query(userQuery, userValues);

    const roleQuery = "INSERT INTO roles (userid, role) VALUES ($1, $2)";
    const roleValues = [result.rows[0].id, "generic"];
    await db.query(roleQuery, roleValues);

    db.release();

    return res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
