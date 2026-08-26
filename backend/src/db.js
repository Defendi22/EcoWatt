import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'

export function createDatabase (dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  }
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      uf TEXT,
      moradores INTEGER DEFAULT 1,
      meta_kwh REAL,
      pontos INTEGER DEFAULT 0,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mes TEXT NOT NULL,
      modo TEXT NOT NULL,
      kwh REAL NOT NULL,
      aparelhos TEXT,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (user_id, mes),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      conquistado_em TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, badge_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  return db
}

export function openDatabase (dbPath) {
  return createDatabase(dbPath)
}
