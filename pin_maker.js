const sqlite = require('sqlite3').verbose();

const numGenerator = () => {
  const nums = [];
  for (let i = 0; i < 5; i++) {
    nums.push(Math.floor(Math.random() * 10).toString());
  }
  return nums.join('');
};

const allPins = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite.Database('./db/games.db');
    db.all(/*sql*/ `SELECT pin FROM active_games`, (err, row) => {
      resolve(row);
    });
    db.close();
  });
};

const getPin = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const pins = await allPins();
      let pin = numGenerator();
      while (pins.includes({ pin: pin })) {
        pin = numGenerator();
      }
      resolve(pin);
    } catch (err) {
      console.log(err);
    }
  });
};

const pinMaker = (hostId) => {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite.Database('./db/games.db');
    try {
      let newPin = await getPin();
      console.log(`adding pin: ${newPin}`);
      db.run(
        /*sql*/ `INSERT INTO active_games(pin, date, host_id) VALUES(?, ?, ?)`,
        [newPin, Date.now(), hostId],
        (err) => {
          if (err) {
            reject(err);
          }
          db.close();
        }
      );
      resolve(newPin);
    } catch (err) {
      console.log(err);
    }
  });
};

module.exports = pinMaker;
