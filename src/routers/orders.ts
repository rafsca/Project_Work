import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";
import { getCart, clearCart } from "../controllers/cartController";
import "dotenv/config";

export const routerOrders = express.Router();

// * 🔒 get orders user
routerOrders.get("/", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: number; role: string };
  const userId = user.id;
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const queryOrder = "SELECT * FROM orders WHERE userid = $1";
    const resultOrder = await db.query(queryOrder, [userId]);
    await db.query("COMMIT");

    return res.status(200).json({ orders: resultOrder.rows });
  } catch (error) {
    await db.query("ROLLBACK");
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});

// * 🔒 Create new order/addresses
routerOrders.post("/", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: number; role: string };
  const userId = user.id;
  const { firstname, lastname, address, postalcode, city, region, country } = req.body;

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const queryAddress = `INSERT INTO addresses (userid, firstname, lastname, address, postalcode, city, region, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
    const valuesAddress = [userId, firstname, lastname, address, postalcode, city, region, country];
    const resultAddress = await db.query(queryAddress, valuesAddress);

    const cart = await getCart(db, userId);

    const queryOrder = `INSERT INTO orders (userid, cartid, addressid, shippingstatus) VALUES ($1, $2, $3, $4)`;
    const valuesOrder = [userId, cart.id, resultAddress.rows[0].id, "Order received"];
    await db.query(queryOrder, valuesOrder);

    await clearCart(db, cart.id);
    await db.query("COMMIT");
    res.status(201).json({ message: "Order created successfully" });
  } catch (error) {
    await db.query("ROLLBACK");
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});

// * 🔓 Get order details
routerOrders.get("/:id", async (req: Request, res: Response) => {
  const orderId = req.params.id;

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    const queryOrder = "SELECT * FROM orders WHERE id = $1";
    const resultOrder = await db.query(queryOrder, [orderId]);

    await db.query("COMMIT");
    return res.status(200).json({ order: resultOrder.rows[0] });
  } catch (error) {
    await db.query("ROLLBACK");
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});

// * 🔒 edit order status
routerOrders.put("/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: number; role: string };
  const { role } = user;

  const orderId = req.params.id;
  const { status } = req.body;

  const db = await pool.connect();
  try {
    if (role !== "admin") return res.status(401).json({ error: "You have to be admin" });

    const queryOrder = `UPDATE orders SET shippingstatus = $1 WHERE id = $2`;
    const valuesOrder = [status, orderId];
    await db.query(queryOrder, valuesOrder);

    return res.status(200).json({ message: "updated order" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});

// * 🔒 edit shipping status delivered
routerOrders.delete("/:id", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const user = req.user as { id: number; role: string };
  const { role } = user;

  const orderId = req.params.id;
  const db = await pool.connect();
  try {
    if (role !== "admin") return res.status(401).json({ error: "You have to be admin" });

    const queryOrder = `UPDATE orders SET shippingstatus = $1 WHERE id = $2`;
    await db.query(queryOrder, ["Order delivered", orderId]);

    return res.status(201).json({ message: "Order delivered" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});
