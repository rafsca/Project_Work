import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import "dotenv/config";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";
import { addProductToCart, getCart, getProductsFromCart, removeProductFromCart, clearCart } from "../controllers/cartController";

export const routerCart = express.Router();

// *🔒 User cart
routerCart.get("", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: string };
  let db;
  try {
    db = await pool.connect();

    const resultCart = await getCart(db, Number(user.id));

    const products = await getProductsFromCart(db, resultCart.productids);

    return res.status(200).json(products);
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔒 Add product to cart
routerCart.post("/add/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const productId = req.params.id;
  let db;
  const user = req.user as { id: string };

  try {
    db = await pool.connect();

    const resultCart = await getCart(db, Number(user.id));
    console.log(resultCart.id);
    const idCart = resultCart.id;

    addProductToCart(db, idCart, Number(productId));

    return res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔒 Remove product from cart
routerCart.delete("/remove/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const productId = req.params.id;
  let db;
  const user = req.user as { id: string };

  try {
    db = await pool.connect();

    const resultCart = await getCart(db, Number(user.id));
    const idCart = resultCart.id;

    removeProductFromCart(db, idCart, Number(productId));

    return res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔒 Clear user cart
routerCart.delete("/clear", authenticateJWT, async (req: CustomRequest, res: Response) => {
  let db;
  const user = req.user as { id: string };

  try {
    const db = await pool.connect();

    const resultCart = await getCart(db, Number(user.id));
    const idCart = resultCart.id;

    const emptyCart = await clearCart(db, idCart);
    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
