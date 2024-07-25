import { handleErr } from "../utils/handleError";
import { pool } from "../config/database";
import { compare, hashSync } from "bcryptjs";
import { isEmailWhitelisted } from "../utils/whitelist";
import { authenticateJWT, CustomRequest } from "../middleware/authenticateJWT";
import "dotenv/config";
import { sign } from "jsonwebtoken";

export const createUser = async (db: any, name: string, email: string, password: string) => {
  const hashPassword = hashSync(password, 10);
  const userQuery = "INSERT INTO users (name, email , password) VALUES ($1, $2, $3) RETURNING id";
  const userValues = [name, email, hashPassword];
  const result = await db.query(userQuery, userValues);
  return result.rows[0].id;
};

export const createRole = async (db: any, userid: number, role: string) => {
  const roleQuery = "INSERT INTO roles (userid, role) VALUES ($1, $2)";
  const roleValues = [userid, role];
  await db.query(roleQuery, roleValues);
};

export const createCart = async (db: any, userid: number, obj: object) => {
  const cartQuery = "INSERT INTO cart (userid, productids) VALUES ($1, $2)";
  const cartValues = [userid, obj];
  await db.query(cartQuery, cartValues);
};

export const validateUserCredentials = async (db: any, email: string, password: string) => {
  const queryUser = `SELECT * FROM users WHERE email = $1`;
  const valuesUser = [email];
  const resultUser = await db.query(queryUser, valuesUser);
  if (resultUser.rows[0].length === 0) return "Invalid Credentials";
  const { id: currentId, password: hashedPassword } = resultUser.rows[0];

  const comparePassword = await compare(password, hashedPassword);
  if (comparePassword === false) return "Invalid Credentials";

  return currentId;
};

export const validateToken = async (db: any, userid: number) => {
  const checkValidToken = `SELECT * FROM tokens WHERE userid = $1`;
  const valuesCheckToken = [userid];
  const resultCheckToken = await db.query(checkValidToken, valuesCheckToken);

  if (resultCheckToken.rows.length > 0) {
    return { token: resultCheckToken.rows[0].token };
  }

  return null;
};

export const generateToken = async (db: any, userid: number) => {
  const queryRole = `SELECT * FROM roles WHERE userid = $1`;
  const resultRole = (await db.query(queryRole, [userid])).rows[0];

  const jwt = sign({ id: userid, role: resultRole.role }, String(process.env.JWT_KEY));
  const queryToken = `INSERT INTO tokens (userid, token) VALUES ($1, $2) RETURNING token`;
  const valuesToken = [userid, jwt];
  const resultToken = await db.query(queryToken, valuesToken);
  return resultToken.rows[0].token;
};

export const findUserById = async (db: any, userid: number) => {
  const queryUser = `SELECT * FROM users WHERE id = $1`;
  const valuesUser = [userid];
  const resultUser = await db.query(queryUser, valuesUser);
  return resultUser.rows[0];
};

export const deleteUserToken = async (db: any, userid: number) => {
  const queryToken = `DELETE FROM tokens WHERE userid = $1`;
  const valueToken = [userid];
  await db.query(queryToken, valueToken);
};
