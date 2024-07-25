import express, { Request, Response } from "express";
import { AuthError, DatabaseError, handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { isEmailWhitelisted } from "../utils/whitelist";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";
import tokenController from "../controllers/tokenController";
import usersController from "../controllers/usersController";
import "dotenv/config";

export const routerUser = express.Router();

// *🔓 User generico register
routerUser.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const db = await pool.connect();

  try {
    await db.query("BEGIN");
    const newUser = await usersController.createUser(db, name, email, password);
    await usersController.createRole(db, newUser, "generic");
    await usersController.createCart(db, newUser, {});
    await db.query("COMMIT");

    res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    await db.query("ROLLBACK");
    handleErr(res, error instanceof DatabaseError ? 500 : 400, error);
  } finally {
    db?.release();
  }
});

// *🔓 User admin register
routerUser.post("/admin/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!isEmailWhitelisted(email)) {
    return res.status(403).json({ error: "You do not have permission to register as an admin" });
  }

  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const newUser = await usersController.createUser(db, name, email, password);
    await usersController.createRole(db, newUser, "admin");
    await usersController.createCart(db, newUser, {});
    await db.query("COMMIT");

    res.status(201).json({ message: "Admin user successfully created" });
  } catch (error) {
    await db.query("ROLLBACK");
    handleErr(res, error instanceof DatabaseError ? 500 : 400, error);
  } finally {
    db?.release();
  }
});

// *🔓 Login
routerUser.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = await pool.connect();

  try {
    const userId = await usersController.validateUserCredentials(db, email, password);
    const existingToken = await tokenController.validateToken(db, userId);

    if (existingToken) {
      res.status(200).json({ validToken: existingToken });
    } else {
      const newToken = await tokenController.generateToken(db, userId);
      res.status(200).json({ newToken: newToken });
    }
  } catch (error) {
    handleErr(res, error instanceof AuthError ? 401 : 500, error);
  } finally {
    db?.release();
  }
});

// *🔒 Logout
routerUser.delete("/logout", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const db = await pool.connect();

  try {
    const user = req.user as { id: number };
    const userId = user.id;

    const findUser = await usersController.findUserById(db, userId);
    if (!findUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await tokenController.deleteUserToken(db, findUser.id);
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});

// *🔒 Get User details
routerUser.get("/user", authenticateJWT, async (req: CustomRequest, res: Response) => {
  const db = await pool.connect();

  try {
    const user = req.user as { id: number; role: string };
    const userId = user.id;

    const findUser = await usersController.findUserById(db, userId);
    if (!findUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ details: { name: findUser.name, email: findUser.email, role: user.role } });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db.release();
  }
});
