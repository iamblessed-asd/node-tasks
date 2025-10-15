import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import db from "./db";
import { fileCleanupJob } from "./cleanup";
import { authRouter, authMiddleware } from "./auth";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use("/api", authRouter);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),

  filename: (req, file, cb) => {
    const id = nanoid(12);
    const ext = path.extname(file.originalname);
    const stored = `${id}${ext}`;
    cb(null, stored);
  }
});
const limits = { fileSize: Number(process.env.MAX_FILE_BYTES ?? 100 * 1024 * 1024) };
const upload = multer({ storage, limits });

//загрузка файла
app.post("/api/upload", authMiddleware, upload.single("file"), (req, res) => {

  if (!req.file) return res.status(400).json({ error: "file required" });

  const id = path.parse(req.file.filename).name;
  const stmt = db.prepare(`INSERT INTO files (id, original_name, stored_name, size, created_at) VALUES (?, ?, ?, ?, ?)`);

  stmt.run(id, req.file.originalname, req.file.filename, req.file.size, Date.now());

  const link = `${req.protocol}://${req.get("host")}/d/${id}`;

  res.json({ id, link, original_name: req.file.originalname, size: req.file.size });
});

// скачивание файла
app.get("/d/:id", (req, res) => {

  const id = req.params.id;
  const row = db.prepare("SELECT * FROM files WHERE id = ?").get(id);

  if (!row) return res.status(404).send("Not found");

  const filePath = path.join(UPLOADS_DIR, row.stored_name);

  if (!fs.existsSync(filePath)) {
    db.prepare("DELETE FROM files WHERE id = ?").run(id);
    return res.status(410).send("Файл не найден или удалён");
  }

  db.prepare("UPDATE files SET last_downloaded_at = ?, download_count = download_count + 1 WHERE id = ?").run(Date.now(), id);
  res.download(filePath, row.original_name);
});

//ручка с информацией о файле
app.get("/api/file/:id", (req, res) => {
  const id = req.params.id;
  const row = db.prepare("SELECT id, original_name, size, created_at, last_downloaded_at, download_count FROM files WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: "файл не найден" });
  res.json(row);
});

fileCleanupJob();

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
