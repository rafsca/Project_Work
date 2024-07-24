import express, { Request, Response } from "express";
import { handleErr } from "./utils/handleError";
import { routerUser } from "./routers/users";

const app = express();
const server = express.json();

const port = process.env.PORT || 3000;
const baseURL = process.env.BASE_URL || "http://localhost";

app.use(server);

app.get("/", async function (req: Request, res: Response) {
  return res.status(200).send("Hello World!");
});

app.use("/api/auth", routerUser);

app.listen(port, function () {
  console.log(`🚀 Server is running on ${baseURL}:${port}`);
});
