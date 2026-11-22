const Database = require('better-sqlite3');

const db = new Database('data/forum.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at date DEFAULT CURRENT_DATE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at DEFAULT CURRENT_DATE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    created_at DEFAULT CURRENT_DATE
  );
`);

class accessDb {
    constructor() {
        this.u1 = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
        this.u2 = db.prepare('SELECT * FROM users WHERE username = ?');
        this.u3 = db.prepare('SELECT * FROM users WHERE id = ?');
    }
    uAdd(name, password){
        if (name){} else {name = null;}
        if (password){} else {password = null;}
        this.u1.run(name, password);
    }
    uGetUname(name){
      return this.u2.get(name)
    }
    uGetId(id){
      return this.u3.get(id)
    }
}

console.log('database connected');

module.exports = new accessDb();