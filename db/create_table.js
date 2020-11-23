const sqlite = require('sqlite3').verbose();
const emitter = require('./clean_db').emitter;

function createTable() {
  const db = new sqlite.Database('./.data/games.db');
  db.serialize(() => {
    db.run(
      /*sql*/ `
      CREATE TABLE IF NOT EXISTS active_games(
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pin TEXT NOT NULL, date TEXT NOT NULL, host_id TEXT NOT NULL)`,
      []
    );
    db.run(
      /*sql*/ `
        CREATE TABLE IF NOT EXISTS players(
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        game_pin INTEGER NOT NULL,
        socket_id TEXT NOT NULL,
        host BOOLEAN NOT NULL,
        name TEXT,
        FOREIGN KEY (game_pin)
        REFERENCES active_games (pin)
        )`,
      () => {
        emitter.emit('tableCreated');
      }
    );
    db.run(/*sql*/ `
      CREATE TABLE IF NOT EXISTS stories(
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pin INTEGER NOT NULL,
      story TEXT,
      current_writer TEXT NOT NULL,
      author TEXT NOT NULL,
      FOREIGN KEY (pin)
      REFERENCES active_games (pin)
      )`);
  });
  db.close();
}

module.exports = createTable;
