import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import "dotenv/config";
import { verifyToken } from "../utils/token";

export const routerCart = express.Router();

// *🔒 User cart
routerCart.get("", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();
    const decode = verifyToken(token);
    const queryCart = `SELECT * FROM cart WHERE userid = $1`;
    const valuesCart = [decode?.id];
    const resultCart = await db.query(queryCart, valuesCart);
    db.release();
    return res.status(200).json(resultCart.rows[0]);
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// *🔒 Add product to cart
routerCart.post("/add/:id", async (req: Request, res: Response) => {
  const productId = req.params.id;
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();
    const decode = verifyToken(token);

    const queryCart = `SELECT * FROM cart WHERE userid = $1`;
    const valuesCart = [decode?.id];
    const resultCart = await db.query(queryCart, valuesCart);
    const idCart = resultCart.rows[0].id;

    const queryUser = `UPDATE cart SET productids = array_append(productids, $1) WHERE id = $2 AND userid = $3`;
    const valuesUser = [Number(productId), idCart, decode?.id];
    await db.query(queryUser, valuesUser);

    db.release();
    return res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// *🔒 Remove product from cart
routerCart.delete("/remove/:id", async (req: Request, res: Response) => {
  const productId = req.params.id;
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();
    const decode = verifyToken(token);
    const queryCart = `SELECT * FROM cart WHERE userid = $1`;
    const valuesCart = [decode?.id];
    const resultCart = await db.query(queryCart, valuesCart);
    const idCart = resultCart.rows[0].id;

    const queryUser = `UPDATE cart SET productids = array_remove(productids, $1) WHERE id = $2 AND userid = $3;`;
    const valuesUser = [productId, idCart, decode?.id];
    db.query(queryUser, valuesUser);
    db.release();
    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// *🔒 Clear user cart
routerCart.delete("/clear", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();
    const decode = verifyToken(token);
    const queryCart = `UPDATE cart SET productids = '{}' WHERE userid = $1`;
    const valuesCart = [decode?.id];
    db.query(queryCart, valuesCart);
    db.release();
    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
