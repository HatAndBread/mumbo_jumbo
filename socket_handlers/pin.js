const dbQ = require('../db/db_query');
const randomName = require('../random_name_generator');

const handlePin = async (socket, io, pin, id) => {
  await dbQ.all(/*sql*/ `SELECT * FROM active_games WHERE pin = ?`, [pin], async (err, row) => {
    let nickname = randomName();
    if (!row.length) {
      io.to(id).emit('notExist');
    } else {
      dbQ.run(/*sql*/ `INSERT INTO players(game_pin, socket_id, host, name)VALUES(?,?,?,?)`, [
        pin,
        id,
        false,
        nickname
      ]);
      let gameStarted = row[0].started;
      console.log('GAME STARTED RESULT: ', gameStarted);
      const hostId = await dbQ.getHostId(pin);
      socket.join(pin);
      io.to(hostId).emit('newPlayer', id, nickname);
      gameStarted ? io.to(id).emit('joinedStartedGame', nickname, hostId) : io.to(id).emit('pinOK', nickname, hostId);
    }
  });
};

module.exports = handlePin;
