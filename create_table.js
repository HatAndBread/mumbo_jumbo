const sqlite = require('sqlite3').verbose();
const emitter = require('./index').emitter;

function createTable() {
  const db = new sqlite.Database('./games.db');
  db.serialize(() => {
    db.run(
      /*sql*/ `CREATE TABLE IF NOT EXISTS active_games(
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pin TEXT NOT NULL, date TEXT NOT NULL)`,
      []
    );
    db.run(
      /*sql*/ `CREATE TABLE IF NOT EXISTS players(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        pin INTEGER NOT NULL,
        FOREIGN KEY (pin)
        REFERENCES active_games (pin)
        )`,
      () => {
        emitter.emit('tableCreated');
      }
    );
  });
  db.close();
}

module.exports = createTable;
