import express from "express";
import db from "./db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET ?? "secret";

router.post("/register", async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: " нужен логин и пароль" });

  const hash = await bcrypt.hash(password, 10);

  try {
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, hash);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "пользователь уже существует" });
  }
});

router.post("/login", async (req, res) => {

  const { username, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user) return res.status(401).json({ error: "неправильный логин или пароль" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "неправильный логин или пароль" });

  const token = jwt.sign({ uid: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

export const authRouter = router;

import { Request, Response, NextFunction } from "express";
declare global { namespace Express { interface Request { user?: any } } }

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "нужно авторизоваться" });
  const m = auth.match(/^Bearer (.+)$/);
  if (!m) return res.status(401).json({ error: "нужно авторизоваться" });
  try {
    const payload = jwt.verify(m[1], JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "неправильный токен" });
  }
}
