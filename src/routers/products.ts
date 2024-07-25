// import express, { Request, Response } from "express";
// import { handleErr } from "../utils/handleError";
// import { pool } from "../config/database";
// import "dotenv/config";

// export const routerProducts = express.Router();

// // !🔒 Add product admin
// routerProducts.post("", async (req: Request, res: Response) => {
//   const token = req.headers.authorization;
//   const { title, price, category, description } = req.body;
//   if (!token) return res.status(404).json({ error: "Missing Token" });

//   try {
//     const db = await pool.connect();

//     const decode = verifyToken(token);
//     if (decode === null) return res.status(401).json({ error: "Invalid token" });

//     const queryRoles = "SELECT * FROM roles WHERE userid= $1";
//     const valuesRoles = [decode.id];
//     const resultRoles = await db.query(queryRoles, valuesRoles);
//     const { role } = resultRoles.rows[0];
//     if (role !== "admin") return res.status(401).json({ error: "You have to be admin" });

//     const queryProduct = "INSERT INTO products (title, price, category, description) VALUES ($1, $2, $3, $4)";
//     const valuesProduct = [title, price, category, description];
//     await db.query(queryProduct, valuesProduct);

//     db.release();
//     return res.status(201).json({ message: "Product sucessfully created" });
//   } catch (error) {
//     handleErr(res, 500, error);
//   }
// });

// // !🔒 edit product admin
// routerProducts.patch("", async (req: Request, res: Response) => {});

// // !🔒 delete product admin
// routerProducts.delete("", async (req: Request, res: Response) => {});
