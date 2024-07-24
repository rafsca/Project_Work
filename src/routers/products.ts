import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import "dotenv/config";

export const routerProducts = express.Router();

//Gestione Admin ⚙️

// Add ✅
routerProducts.post("", async (req: Request, res: Response) => {
  const { title, price, category, description } = req.body;

  try {
    const db = await pool.connect();

    const queryProduct = "INSERT INTO products (title, price, category, description) VALUES ($1, $2, $3, $4)";
    const valuesProduct = [title, price, category, description];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// Edit ✒️
routerProducts.patch("", async (req: Request, res: Response) => {});

// Delete ❌
routerProducts.delete("", async (req: Request, res: Response) => {});
