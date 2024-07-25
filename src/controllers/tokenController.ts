import { sign } from "jsonwebtoken";
import { VercelPoolClient } from "@vercel/postgres";
import { DatabaseError, AuthError } from "../utils/handleError";
import "dotenv/config";

interface Token {
  token: string;
}

class TokenController {
  public validateToken = async (db: VercelPoolClient, userid: number): Promise<Token | null> => {
    try {
      const checkValidToken = `SELECT token FROM tokens WHERE userid = $1`;
      const result = await db.query(checkValidToken, [userid]);

      return result.rows.length > 0 ? result.rows[0].token : null;
    } catch (error) {
      console.error("Error validating token:", error);
      throw new DatabaseError("Failed to validate token");
    }
  };

  public generateToken = async (db: VercelPoolClient, userid: number): Promise<string> => {
    try {
      const queryRole = `SELECT role FROM roles WHERE userid = $1`;
      const roleResult = await db.query(queryRole, [userid]);

      if (roleResult.rows.length === 0) {
        throw new AuthError("User not found");
      }

      const { role } = roleResult.rows[0];
      const jwt = sign({ id: userid, role: role }, String(process.env.JWT_KEY));

      const queryToken = `INSERT INTO tokens (userid, token) VALUES ($1, $2) RETURNING token`;
      const tokenResult = await db.query(queryToken, [userid, jwt]);

      return tokenResult.rows[0].token;
    } catch (error) {
      console.error("Error generating token:", error);
      throw new DatabaseError("Failed to generate token");
    }
  };

  public deleteUserToken = async (db: VercelPoolClient, userid: number): Promise<void> => {
    try {
      const queryToken = `DELETE FROM tokens WHERE userid = $1`;
      await db.query(queryToken, [userid]);
    } catch (error) {
      console.error("Error deleting user token:", error);
      throw new DatabaseError("Failed to delete user token");
    }
  };
}

export default new TokenController();
