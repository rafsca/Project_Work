import { VercelPoolClient } from "@vercel/postgres";
import { compare, hashSync } from "bcryptjs";
import { DatabaseError, AuthError } from "../utils/handleError";
import "dotenv/config";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}
class UserController {
  public createUser = async (db: VercelPoolClient, name: string, email: string, password: string): Promise<number> => {
    try {
      const hashPassword = hashSync(password, 10);
      const userQuery = "INSERT INTO users (name, email , password) VALUES ($1, $2, $3) RETURNING id";
      const userValues = [name, email, hashPassword];
      const result = await db.query(userQuery, userValues);
      return result.rows[0].id;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new DatabaseError("Failed to create user");
    }
  };

  public createRole = async (db: VercelPoolClient, userid: number, role: string): Promise<void> => {
    try {
      const roleQuery = "INSERT INTO roles (userid, role) VALUES ($1, $2)";
      const roleValues = [userid, role];
      await db.query(roleQuery, roleValues);
    } catch (error) {
      console.error("Error creating user role:", error);
      throw new DatabaseError("Failed to create user role");
    }
  };

  public createCart = async (db: VercelPoolClient, userid: number, obj: object): Promise<void> => {
    try {
      const cartQuery = "INSERT INTO cart (userid, productids) VALUES ($1, $2)";
      const cartValues = [userid, obj];
      await db.query(cartQuery, cartValues);
    } catch (error) {
      console.error("Error creating user cart:", error);
      throw new DatabaseError("Failed to create user cart");
    }
  };

  public validateUserCredentials = async (db: VercelPoolClient, email: string, password: string): Promise<number> => {
    try {
      const queryUser = `SELECT * FROM users WHERE email = $1`;
      const resultUser = await db.query(queryUser, [email]);

      if (resultUser.rows.length === 0) throw new AuthError("Invalid Credentials");
      const { id: currentId, password: hashedPassword } = resultUser.rows[0];

      const comparePassword = await compare(password, hashedPassword);
      if (!comparePassword) throw new AuthError("Invalid Credentials");

      return currentId;
    } catch (error) {
      console.error("Error validating user credentials:", error);
      throw error;
    }
  };

  public findUserById = async (db: VercelPoolClient, userid: number): Promise<User> => {
    try {
      const queryUser = `SELECT * FROM users WHERE id = $1`;
      const resultUser = await db.query(queryUser, [userid]);
      return resultUser.rows[0];
    } catch (error) {
      console.error("Error validating user id:", error);
      throw error;
    }
  };
}
export default new UserController();
