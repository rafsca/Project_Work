import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import "dotenv/config";
import { parse } from "dotenv";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";
import { verify, sign } from "jsonwebtoken";
import { verifyToken } from "../utils/token";

export const routerOrders = express.Router();

//Restituisce lo storico degli ordini dell'utente
routerOrders.get(
  "/:id",
  authenticateJWT,
  async (req: CustomRequest, res: Response) => {
    const user = req.user as { id: number; role: string };
    const idUser = req.params.id;

    try {
      const db = await pool.connect();

      const queryOrder = "SELECT * FROM orders WHERE userid = $1";
      const valuesOrder = [user];
      await db.query(queryOrder, [user]);

      db.release();
      return res.status(201).json({ message: "Product successfully returned" });
    } catch (error) {
      handleErr(res, 500, error);
    }
  }
);

//sistema di paginazione per migliorare le performance dell’API.
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

//Permette agli utenti di creare un nuovo ordine partendo dai prodotti presenti nel carrello, con l’aggiunta dei dati di spedizione.
routerOrders.post("/", authenticateJWT, async (req: Request, res: Response) => {
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
    const db = await pool.connect();

    const orderQuery = `INSERT INTO orders (user_id, first_name, last_name, address, postal_code, city, region, country) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
    const valuesOrder = [
      userid,
      firstname,
      lastname,
      address,
      postal_code,
      city,
      region,
      country,
    ];
    await db.query(orderQuery, valuesOrder);
    db.release();

    res.status(201).json({ message: "Order created successfully" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

//Restituisce i dettagli di un singolo ordine identificato dal suo ID.
routerOrders.get("/:id", async (req: Request, res: Response) => {
  const orderId = req.params.id;

  try {
    const db = await pool.connect();

    const queryOrder = "SELECT * FROM products WHERE id=$1";
    const valuesOrder = [orderId];
    const resultOrder = await db.query(queryOrder, valuesOrder);
    console.log(resultOrder.rows[0]);

    const { title, price, category, description } = resultOrder.rows[0];
    if (resultOrder.rows[0].length === 0)
      return res.status(404).json({ message: "Not found" });

    db.release();
    return res.status(201).json({ title, price, category, description });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

//Consente agli amministratori di aggiornare lo stato di un ordine esistente.
routerOrders.put(
  "/:id",
  authenticateJWT,
  async (req: CustomRequest, res: Response) => {
    const user = req.user as { id: number; role: string };
    const { id, role } = user;
    const orderId = req.params.id;
    const { status } = req.body;

    try {
      const db = await pool.connect();
      if (role !== "admin")
        return res.status(401).json({ error: "You have to be admin" });
      const queryOrder = `UPDATE orders
        SET status = $1
        WHERE id = $2
        RETURNING *;`;

      const valuesOrder = [status, orderId];
      await db.query(queryOrder, valuesOrder);
      db.release();

      return res.status(201).json({ message: "updated order" });
    } catch (error) {
      handleErr(res, 500, error);
    }
  }
);

//Permette agli amministratori di cancellare un ordine.
routerOrders.delete(
  "/:id",
  authenticateJWT,
  async (req: CustomRequest, res: Response) => {
    const user = req.user as { id: number; role: string };
    const { id, role } = user;
    const orderId = req.params.id;

    try {
      const db = await pool.connect();
      if (role !== "admin")
        return res.status(401).json({ error: "You have to be admin" });
      const queryOrder = `
          DELETE FROM orders
            WHERE id = $1
    ;`;

      const valuesOrder = [orderId];
      await db.query(queryOrder, valuesOrder);
      db.release();

      return res.status(201).json({ message: "orde deleted" });
    } catch (error) {
      handleErr(res, 500, error);
    }
  }
);
