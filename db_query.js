const sqlite = require('sqlite3');

const runDb = (sql, params) => {
  const db = new sqlite.Database('./games.db');
  db.run(sql, params);
  db.close();
};

const allDb = (sql, params, callback) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database('./games.db');
    try {
      db.all(sql, params, callback);
      db.close();
      resolve(true);
    } catch (err) {
      reject(console.log(err));
      db.close();
    }
  });
};

const getDb = (sql, params, callback) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database('./games.db');
    try {
      db.all(sql, params, callback);
      db.close();
      resolve(true);
    } catch (err) {
      reject(err);
      db.close();
    }
  });
};

const getHostId = async (gamePin) => {
  const db = new sqlite.Database('./games.db');
  const hostId = await new Promise((resolve, reject) => {
    db.get(/*sql*/ `SELECT host_id FROM active_games WHERE pin = ?`, [gamePin], (err, row) => {
      err && reject(err);
      resolve(row.host_id);
    });
  });
  db.close();
  return hostId;
};

module.exports = { run: runDb, all: allDb, get: getDb, getHostId: getHostId };
