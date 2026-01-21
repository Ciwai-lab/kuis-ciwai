const Database = require("better-sqlite3");

const db = new Database("data.db");

// bikin tabel kalau belum ada
db.prepare(`
  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quizId INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON string
    correctIndex INTEGER NOT NULL,
    FOREIGN KEY (quizId) REFERENCES quizzes(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS hosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`).run();

try {
    db.prepare(`ALTER TABLE quizzes ADD COLUMN hostId INTEGER`).run();
} catch (e) {
    // kolom sudah ada, abaikan
}


module.exports = db;
