const sqlite = require('sqlite3').verbose();

const runDb = (sql, params) => {
  const db = new sqlite.Database('./.data/games.db');
  db.run(sql, params);
  db.close();
};

const allDb = (sql, params, callback) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database('./.data/games.db');
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
    const db = new sqlite.Database('./.data/games.db');
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

const checkIfGameStarted = (pin) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database('./.data/games.db');
    try {
      db.get(/*sql*/ `SELECT started FROM active_games WHERE pin = ?`, [pin], (err, row) => {
        if (row.started) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      db.close();
    } catch (err) {
      reject(err);
      db.close();
    }
  });
};

const rejoin = (pin, nickname, playerId) => {
  return new Promise(function (resolve, reject) {
    const db = new sqlite.Database('./.data/games.db');
    try {
      db.serialize(function () {
        db.run(
          /*sql*/ `UPDATE players
          SET socket_id = ?
          WHERE game_pin = ?
          AND name = ?`,
          [playerId, pin, nickname],
          function (err) {
            if (err || !this.changes) {
              console.log(err);
              resolve(false);
            }
          }
        );
        db.run(
          /*sql*/ `UPDATE stories
          SET current_writer = ?
          WHERE author = ?
          AND pin = ?`,
          [playerId, nickname, pin],
          function (err) {
            if (err) {
              console.log(err);
            }
            resolve(true);
          }
        );
      });
      db.close();
    } catch (err) {
      console.log(err);
      reject(false);
    }
  });
};

const getPlayersStory = (id) => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database('./.data/games.db');
    try {
      db.get(/*sql*/ `SELECT story FROM stories WHERE current_writer = ?`, [id], function (err, row) {
        err && reject(err);
        if (row) {
          resolve(row.story);
        } else {
          resolve('');
        }
      });
      db.close();
    } catch (err) {
      console.log(err);
      reject(false);
      db.close();
    }
  });
};

const getHostId = async (gamePin) => {
  const db = new sqlite.Database('./.data/games.db');
  const hostId = await new Promise((resolve, reject) => {
    db.get(/*sql*/ `SELECT host_id FROM active_games WHERE pin = ?`, [gamePin], (err, row) => {
      err && reject(err);
      resolve(row.host_id);
    });
  });
  db.close();
  return hostId;
};

const getPinFromUserId = async (id) => {
  const db = new sqlite.Database('./.data/games.db');
  const pin = await new Promise((resolve, reject) => {
    db.get(
      /*sql*/ `SELECT p.game_pin, p.name, a.host_id
              FROM players p JOIN active_games a
              ON p.game_pin = a.pin
              AND p.socket_id = ?`,
      [id],
      (err, row) => {
        err && reject(err);
        if (row) {
          resolve(row);
        } else {
          resolve('user not connected to game');
        }
      }
    );
  });
  db.close();
  return pin;
};

module.exports = {
  run: runDb,
  all: allDb,
  get: getDb,
  getHostId: getHostId,
  getPinFromUserId: getPinFromUserId,
  rejoin: rejoin,
  checkIfGameStarted: checkIfGameStarted,
  getPlayersStory: getPlayersStory
};
