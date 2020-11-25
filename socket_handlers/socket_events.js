const handlePin = require('./pin');
const hostGamePin = require('./host_game_pin');
const run = require('../db/db_query').run;
const getHostId = require('../db/db_query').getHostId;
const getPinFromUserId = require('../db/db_query').getPinFromUserId;

const socketEvents = (io) => {
  io.on('connection', (socket) => {
    socket.on('disconnect', async (reason) => {
      console.log(reason);
      console.log(socket.id, 'disconnected!');
      let result = await getPinFromUserId(socket.id);
      console.log(result);
      if (result.game_pin) {
        io.to(result.host_id).emit('playerDisconnected', result.name, socket.id);
        console.log(`user id ${socket.id} disconnected from game id ${result.game_pin}`);
      }
    });
    socket.on('disconnecting', (reason) => {
      console.log('disconnecting!');
      console.log(socket.rooms);
    });
    socket.on('submitPin', (pin, id) => {
      console.log('participant id: ', id);
      console.log('entered pin: ', pin);
      handlePin(socket, io, pin, id);
    });
    socket.on('hostGetPin', (id) => {
      console.log('host id: ', id);
      hostGamePin(socket, io, id);
    });
    socket.on('shuffle', (pin) => {
      socket.to(pin).emit('retrieveStory');
    });
    socket.on('turnInStory', async (id, story, gamePin, hostId) => {
      run(/*sql*/ `UPDATE stories SET story = ? WHERE pin = ? AND current_writer = ?`, [story, gamePin, id]);
      console.log('REtrieved story! player id: ', id);
      console.log('REtrieved story! story: ', story);
      io.to(hostId).emit('storySubmit', { id: id, story: story });
    });
    socket.on('distributeStories', (players, gamePin) => {
      console.log('new story distribution!', players[0].story);
      players.forEach((player) => {
        io.to(player.id).emit('newStory', player.story);
        run(/*sql*/ `UPDATE stories SET story = ? WHERE pin = ? AND current_writer = ?`, [
          player.story,
          gamePin,
          player.id
        ]);
      });
    });
    socket.on('startingGame', (pin, players) => {
      console.log(players);
      players.forEach((player) => {
        run(
          /*sql*/ `INSERT INTO stories (pin, story,current_writer, author)
         VALUES(?,?,?,?)`,
          [pin, player.story, player.id, player.nickname]
        );
      });
      socket.to(pin).emit('startWriting');
    });
    socket.on('retrieveStoryProgress', (id) => {
      io.to(id).emit('retrieveStoryProgress');
    });
    socket.on('sendStoryProgressToHost', async (id, story, gamePin) => {
      let hostId = await getHostId(gamePin);
      io.to(hostId).emit('sendStoryProgressToHost', id, story);
    });
    socket.on('deleteDisconnectedPlayer', (gamePin, playerId) => {
      console.log('DELETING ' + playerId + 'from' + gamePin);
      run(/*sql */ `DELETE FROM players WHERE game_pin = ? AND socket_id = ?`, [gamePin, playerId]);
      run(/*sql*/ `DELETE FROM stories WHERE pin = ? AND current_writer = ?`, [gamePin, playerId]);
    });
  });
};

module.exports = socketEvents;
