import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH  = path.join(DATA_DIR, 'jstqb.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS domains (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    domain_id   INTEGER NOT NULL,
    text        TEXT    NOT NULL,
    difficulty  INTEGER NOT NULL DEFAULT 2,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
  );

  CREATE TABLE IF NOT EXISTS choices (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    text        TEXT    NOT NULL,
    is_correct  INTEGER NOT NULL DEFAULT 0,
    order_num   INTEGER NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS explanations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL UNIQUE,
    text        TEXT    NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS answer_history (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id        INTEGER NOT NULL,
    selected_choice_id INTEGER NOT NULL,
    is_correct         INTEGER NOT NULL,
    answered_at        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (question_id)        REFERENCES questions(id),
    FOREIGN KEY (selected_choice_id) REFERENCES choices(id)
  );
`);

export default db;
