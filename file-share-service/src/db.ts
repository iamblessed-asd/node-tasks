import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const datadir = path.join(__dirname, "..", "data");
if (!fs.existsSync(datadir)) fs.mkdirSync(datadir, { recursive: true });

const db = new Database(path.join(datadir, "db.sqlite"));

db.exec(`
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  original_name TEXT,
  stored_name TEXT,
  size INTEGER,
  created_at INTEGER,
  last_downloaded_at INTEGER,
  download_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password_hash TEXT
);
`);

export default db;
