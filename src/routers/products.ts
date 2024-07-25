/*- GET /api/products: Restituisce l'elenco completo dei prodotti disponibili nel catalogo.

- Opzionale: implementare un sistema di paginazione per migliorare le performance dell’API

- GET /api/products/:id: Restituisce i dettagli di un singolo prodotto (identificato dal suo ID).

- POST /api/products: Permette agli utenti Admin di aggiungere un nuovo prodotto al catalogo.

- PUT /api/products/:id: Consente agli utenti Admin di modificare le informazioni di un prodotto esistente.

- DELETE /api/products/:id: Permette agli utenti Admin di eliminare un prodotto dal catalogo.
*/

import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { verify, sign } from "jsonwebtoken";
import "dotenv/config";
import { verifyToken } from "../utils/token";

export const routerProducts = express.Router();

//Gestione Admin ⚙️

// Add ✅ 🔒
routerProducts.post("/", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { title, price, category, description } = req.body;
  if (!token) return res.status(404).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();

    const decode = verifyToken(token);
    if(decode === null)return res.status(401).json({error: "Invalid token"});

    const queryRoles= "SELECT * FROM roles WHERE userid= $1";
    const valuesRoles = [decode.id];
    const resultRoles = await db.query(queryRoles, valuesRoles);
    const {role} = resultRoles.rows[0];
    if(role !== "admin") return res.status(401).json({error: "You have to be admin"});
    
    const queryProduct = "INSERT INTO products (title, price, category, description) VALUES ($1, $2, $3, $4)";
    const valuesProduct = [title, price, category, description];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// Edit ✒️ 🔒
routerProducts.patch("/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { title, price, category, description } = req.body;
  const { id } = req.params;

  if (!token) return res.status(404).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();

    const decode = verifyToken(token);
    if(decode === null)return res.status(401).json({error: "Invalid token"});

    const queryRoles= "SELECT * FROM roles WHERE userid= $1";
    const valuesRoles = [decode.id];
    const resultRoles = await db.query(queryRoles, valuesRoles);
    const {role} = resultRoles.rows[0];
    if(role !== "admin") return res.status(401).json({error: "You have to be admin"});
    
    const queryProduct = `UPDATE products
        SET title = $1, price = $2, category = $3, description = $4
        WHERE id=$5
        RETURNING *;`;
    const valuesProduct = [title, price, category, description, id];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully modified" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// Delete ❌
routerProducts.delete("/:id", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { id } = req.params;

  if (!token) return res.status(404).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();

    const decode = verifyToken(token);
    if(decode === null)return res.status(401).json({error: "Invalid token"});

    const queryRoles= "SELECT * FROM roles WHERE userid= $1";
    const valuesRoles = [decode.id];
    const resultRoles = await db.query(queryRoles, valuesRoles);
    const {role} = resultRoles.rows[0];
    if(role !== "admin") return res.status(401).json({error: "You have to be admin"});
    
    const queryProduct = `
          DELETE FROM products
            WHERE id = $1
    `;
    const valuesProduct = [id];
    await db.query(queryProduct, valuesProduct);

    db.release();
    return res.status(201).json({ message: "Product sucessfully deleted" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
