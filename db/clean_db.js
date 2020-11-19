const EventEmitter = require('events');
const sqlite = require('sqlite3').verbose();
const pinMaker = require('../pin_maker');

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

const cleanDb = () => {
  emitter.on('tableCreated', () => {
    pinMaker(Math.random()); // GENERATE PIN. DELETE ME!!!!
    setInterval(function () {
      const db = new sqlite.Database('./db/games.db');
      db.run(/*sql*/ `DELETE FROM active_games WHERE date < ?`, [Date.now() - 1000 * 60 * 60 * 24], function (err) {
        err && console.log(err);
        console.log(`Cleaned ${this.changes} old games from the database`);
      });
      db.close();
    }, 100000);
  });
};
module.exports = { emitter: emitter, cleanDb: cleanDb };
