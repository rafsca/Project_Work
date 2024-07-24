import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { compare, hashSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { isEmailWhitelisted } from "../utils/whitelist";
import { verifyToken } from "../utils/token";
import "dotenv/config";

export const routerUser = express.Router();

// *🔓 User generico register
routerUser.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const db = await pool.connect();

    // User
    const hashPassword = hashSync(password, 10);
    const userQuery = "INSERT INTO users (name, email , password) VALUES ($1, $2, $3) RETURNING id";
    const userValues = [name, email, hashPassword];
    const result = await db.query(userQuery, userValues);
    const { id: userId } = result.rows[0];

    // Role user
    const roleQuery = "INSERT INTO roles (userid, role) VALUES ($1, $2)";
    const roleValues = [userId, "generic"];
    await db.query(roleQuery, roleValues);

    // Cart user
    const cartQuery = "INSERT INTO cart (userid, productids) VALUES ($1, $2)";
    const cartValues = [userId, {}];
    await db.query(cartQuery, cartValues);

    db.release();

    return res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// *🔓 User admin register
routerUser.post("/admin/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!isEmailWhitelisted(email)) return res.status(403).send("You do not have permission to register as an admin");

  try {
    const db = await pool.connect();

    // User
    const hashPassword = hashSync(password, Number(process.env.SALT_GENERIC));
    const userQuery = "INSERT INTO users (name, email , password) VALUES ($1, $2, $3) RETURNING id";
    const userValues = [name, email, hashPassword];
    const result = await db.query(userQuery, userValues);
    const { id: userId } = result.rows[0];

    // Role admin user
    const roleQuery = "INSERT INTO roles (userid, role) VALUES ($1, $2)";
    const roleValues = [userId, "admin"];
    await db.query(roleQuery, roleValues);

    // Cart user
    const cartQuery = "INSERT INTO cart (userid, productids) VALUES ($1, $2)";
    const cartValues = [userId, {}];
    await db.query(cartQuery, cartValues);

    db.release();

    return res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// ?🔓 Login
routerUser.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const db = await pool.connect();

    // Login
    const queryUser = `SELECT * FROM users WHERE email = $1`;
    const valuesUser = [email];
    const resultUser = await db.query(queryUser, valuesUser);
    const { id: currentId, name: currentName, email: currentEmail, password: hashedPassword } = resultUser.rows[0];

    // Compare hash password
    const comparePassword = await compare(password, hashedPassword);
    if (comparePassword === false) return res.status(401).json({ error: "Invalid Password" });

    // Check valid token
    const checkValidToken = `SELECT * FROM tokens WHERE userid = $1`;
    const valuesCheckToken = [currentId];
    const resultCheckToken = await db.query(checkValidToken, valuesCheckToken);

    if (resultCheckToken.rows.length > 0) {
      return res.status(200).json({ token: resultCheckToken.rows[0].token });
    }

    // Create new token
    const jwt = sign({ id: currentId, name: currentName, email: currentEmail }, String(process.env.JWT_KEY));
    const queryToken = `INSERT INTO tokens (userid, token) VALUES ($1, $2) RETURNING token`;
    const valuesToken = [currentId, jwt];
    const resultToken = await db.query(queryToken, valuesToken);
    const newToken = resultToken.rows[0];

    db.release();

    return res.status(200).json(newToken);
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// !🔒 Logout
routerUser.delete("/logout", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();
    const decode = verifyToken(token);

    const queryUser = `SELECT * FROM users WHERE id = $1`;
    const valuesUser = [decode?.id];
    const resultUser = await db.query(queryUser, valuesUser);

    const { id: currentId } = resultUser.rows[0];
    if (resultUser.rows[0].length === 0 || currentId !== decode?.id)
      return res.status(404).json({ message: "Not found" });

    const queryToken = `DELETE FROM tokens WHERE userid = $1`;
    const valueToken = [currentId];
    await db.query(queryToken, valueToken);
    db.release();
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    handleErr(res, 500, error);
  }
});

// !🔒 Get User details
routerUser.get("/user", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Missing Token" });

  try {
    const db = await pool.connect();
    const decode = verifyToken(token);

    const queryUser = `SELECT users.id, users.name, users.email, roles.role FROM users INNER JOIN roles ON users.id = roles.userid WHERE users.id = $1 `;
    const valuesUser = [decode?.id];
    const resultUser = await db.query(queryUser, valuesUser);
    console.log(resultUser.rows[0]);

    const { id: currentId, name, email, role } = resultUser.rows[0];
    if (resultUser.rows[0].length === 0 || currentId !== decode?.id)
      return res.status(404).json({ message: "Not found" });

    db.release();
    res.status(200).json({ details: { name, email, role } });
  } catch (error) {
    handleErr(res, 500, error);
  }
});
