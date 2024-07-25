import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import "dotenv/config";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";

export const routerProducts = express.Router();

// * 🔒 Add product Admin
routerProducts.post("/", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: number; role: string };
  const { title, price, category, description } = req.body;
  const { id, role } = user;

  try {
    const db = await pool.connect();

    if (role !== "admin") return res.status(401).json({ error: "You have to be admin" });

    const queryProduct = "INSERT INTO products (title, price, category, description) VALUES ($1, $2, $3, $4)";
    const valuesProduct = [title, price, category, description];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// * 🔒 Edit products admin
routerProducts.patch("/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: string; role: string };
  const productId = req.params.id;
  const { title, price, category, description } = req.body;
  const { id, role } = user;

  try {
    const db = await pool.connect();
    if (role !== "admin") return res.status(401).json({ error: "You have to be admin" });

    const queryProduct = `UPDATE products
        SET title = $1, price = $2, category = $3, description = $4
        WHERE id=$5
        RETURNING *;`;
    const valuesProduct = [title, price, category, description, productId];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully modified" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// * 🔒 Delete products admin
routerProducts.delete("/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: number; role: string };
  const productId = req.params.id;
  const { id, role } = user;

  try {
    const db = await pool.connect();

    if (role !== "admin") return res.status(401).json({ error: "You have to be admin" });

    const queryProduct = `
          DELETE FROM products
            WHERE id = $1
    `;
    const valuesProduct = [productId];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully deleted" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// * 🔓 Details of single product
routerProducts.get("/:id", async (req: Request, res: Response) => {
  const productId = req.params.id;

  try {
    const db = await pool.connect();

    const queryProduct = "SELECT * FROM products WHERE id=$1";
    const valuesProduct = [productId];
    const resultProduct = await db.query(queryProduct, valuesProduct);
    console.log(resultProduct.rows[0]);

    const { title, price, category, description } = resultProduct.rows[0];
    if (resultProduct.rows[0].length === 0) return res.status(404).json({ message: "Not found" });

    db.release();
    return res.status(201).json({ title, price, category, description });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// * 🔓 List of products
routerProducts.get("/", async (req: Request, res: Response) => {
  try {
    const db = await pool.connect();

    const queryProduct = "SELECT * FROM products";
    const resultProduct = await db.query(queryProduct);
    console.log(resultProduct.rows);

    if (resultProduct.rows[0].length === 0) return res.status(404).json({ message: "Not found" });

    db.release();
    return res.status(201).json({ details: resultProduct.rows });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
