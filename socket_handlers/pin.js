const express = require('express');
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
      const hostId = await dbQ.getHostId(pin);
      io.to(id).emit('pinOK', nickname, hostId);
      io.to(hostId).emit('newPlayer', id, nickname);
      socket.join(pin);
    }
  });
};

module.exports = handlePin;
