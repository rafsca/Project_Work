import express, { Request, Response } from "express";
import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { isEmailWhitelisted } from "../utils/whitelist";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";
import "dotenv/config";
import {
  createUser,
  createRole,
  createCart,
  validateUserCredentials,
  validateToken,
  generateToken,
  findUserById,
  deleteUserToken,
} from "../controllers/usersController";

export const routerUser = express.Router();

// *🔓 User generico register
routerUser.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  let db;
  try {
    db = await pool.connect();

    const newUser = await createUser(db, name, email, password);
    await createRole(db, newUser, "generic");
    await createCart(db, newUser, {});

    return res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔓 User admin register
routerUser.post("/admin/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!isEmailWhitelisted(email)) return res.status(403).send("You do not have permission to register as an admin");
  let db;

  try {
    db = await pool.connect();

    const newUser = await createUser(db, name, email, password);
    await createRole(db, newUser, "admin");
    await createCart(db, newUser, {});

    return res.status(201).json({ message: "User successfully created" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔓 Login
routerUser.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  let db;
  try {
    db = await pool.connect();

    const validateUser = await validateUserCredentials(db, email, password);

    const checkToken = await validateToken(db, validateUser);
    if (checkToken) return res.status(200).json(checkToken);

    const newToken = await generateToken(db, validateUser);
    return res.status(200).json({ token: newToken });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔒 Logout
routerUser.delete("/logout", authenticateJWT, async (req: CustomRequest, res: Response) => {
  let db;
  try {
    db = await pool.connect();
    const user = req.user as { id: string };
    const userId = user.id;

    const findUser = await findUserById(db, Number(userId));
    if (!findUser || findUser.id !== userId) return res.status(404).json({ message: "Not found" });

    await deleteUserToken(db, findUser.id);
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});

// *🔒 Get User details
routerUser.get("/user", authenticateJWT, async (req: CustomRequest, res: Response) => {
  let db;
  try {
    db = await pool.connect();
    const user = req.user as { id: string; role: string };
    const userId = user.id;

    const findUser = await findUserById(db, Number(userId));
    if (!findUser) return res.status(404).json({ message: "Not found" });

    res.status(200).json({ details: { name: findUser.name, email: findUser.email, role: user.role } });
  } catch (error) {
    handleErr(res, 500, error);
  } finally {
    db?.release();
  }
});
