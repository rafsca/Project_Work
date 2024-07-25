import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import "dotenv/config";
import { parse } from "dotenv";

export const routerOrders = express.Router();

routerOrders.get("/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });
  const idUser = req.params.id;

  try {
    const query = "SELECT * FROM orders WHERE userid = $1";
    const { rows } = await pool.query(query, [idUser]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    handleErr(res, 500, error);
  }
});

routerOrders.get("/api/items", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query("SELECT * FROM items LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
    const rows = result.rows;
    const {
      rows: [{ total_count }],
    } = await pool.query("SELECT COUNT(*) as total_count FROM items");
    const totalPages = Math.ceil(total_count / limit);

    res.json({
      data: rows,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_count: total_count,
        per_page: limit,
      },
    });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

routerOrders.post("/", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  const {
    userid,
    firstname,
    lastname,
    address,
    postal_code,
    city,
    region,
    country,
    items,
  } = req.body;

  try {
    await pool.query("BEGIN");
    const orderQuery = `INSERT INTO orders (user_id, first_name, last_name, address, postal_code, city, region, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
    const result = await pool.query(orderQuery, [
      userid,
      firstname,
      lastname,
      address,
      postal_code,
      city,
      region,
      country,
    ]);
    const orderId = result.rows[0].id;

    const itemQuery = `INSERT INTO order_items (order_id, product_id, quantity, price)VALUES ($1, $2, $3, $4)`;
    for (const item of items) {
      await pool.query(itemQuery, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
      ]);
    }

    await pool.query("COMMIT");

    res.status(201).json({ message: "Order created successfully", orderId });
  } catch (error) {
    await pool.query("ROLLBACK");
    handleErr(res, 500, error);
  }
});

routerOrders.get("/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });
  const orderId = parseInt(req.params.id);

  try {
    const query = `SELECT
        o.id AS order_id,
        o.user_id,
        o.first_name,
        o.last_name,
        o.address,
        o.postal_code,
        o.city,
        o.region,
        o.country,
        o.created_at,
        json_agg(
            json_build_object(
                'item_id', oi.id,
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'price', oi.price
            )
        ) AS items
    FROM
        orders o
    JOIN
        order_items oi ON o.id = oi.order_id
    WHERE
        o.id = $1
    GROUP BY
        o.id;`;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    handleErr(res, 500, error);
  }
});

routerOrders.put("/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const query = `UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING *;`;

    const result = await pool.query(query, [status, orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "order not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    handleErr(res, 500, error);
  }
});

routerOrders.delete("/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });
  const orderId = parseInt(req.params.id);

  try {
    const query = `DELETE FROM orders
        WHERE id = $1
        RETURNING *;`;

    const result = await pool.query(query, [orderId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
      deletedOrder: result.rows[0],
    });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
