import db from "./db";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const DAYS = Number(process.env.EXPIRE_DAYS ?? 30);
const INTERVAL_MS = 24 * 60 * 60 * 1000; // Job для удаления файлов каждый день

export function fileCleanupJob() {
  setInterval(runCleanup, INTERVAL_MS);
  runCleanup();
}

function runCleanup() {
  const threshold = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  const rows = db.prepare(`
    SELECT id, stored_name, created_at, last_downloaded_at FROM files
    WHERE (last_downloaded_at IS NULL AND created_at < ?)
       OR (last_downloaded_at IS NOT NULL AND last_downloaded_at < ?)
  `).all(threshold, threshold);

  for (const r of rows) {
    const p = path.join(UPLOADS_DIR, r.stored_name);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (err) {
      console.error("Ошибка удаления ссылки", p, err);
    }
    db.prepare("DELETE FROM files WHERE id = ?").run(r.id);
    console.log("Удалён файл", r.id);
  }
}
