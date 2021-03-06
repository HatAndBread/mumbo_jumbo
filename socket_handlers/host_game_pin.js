const pinMaker = require('../pin_maker');
const dbQ = require('../db/db_query');

const hostGamePin = async (socket, io, id) => {
  const pin = await pinMaker(id);
  console.log('Creating room: ', pin);
  dbQ.run(/*sql*/ `INSERT INTO players(game_pin, socket_id, host, date) VALUES(?,?,?,?)`, [pin, id, true, Date.now()]);
  socket.join(pin);
  io.to(id).emit('gameCreated', pin);
};

module.exports = hostGamePin;
