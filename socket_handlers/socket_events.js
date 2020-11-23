const handlePin = require('./pin');
const hostGamePin = require('./host_game_pin');
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
    socket.on('turnInStory', async (id, story, gamePin) => {
      console.log('REtrieved story! player id: ', id);
      console.log('REtrieved story! story: ', story);
      let hostId = await getHostId(gamePin);
      console.log('Got the host id!: ', hostId);
      io.to(hostId).emit('storySubmit', { id: id, story: story });
    });
    socket.on('distributeStories', (players) => {
      console.log('new story distribution!', players[0].story);
      players.forEach((player) => {
        io.to(player.id).emit('newStory', player.story);
      });
    });
    socket.on('startingGame', (pin) => {
      socket.to(pin).emit('startWriting');
    });
    socket.on('retrieveStoryProgress', (id) => {
      io.to(id).emit('retrieveStoryProgress');
    });
    socket.on('sendStoryProgressToHost', async (id, story, gamePin) => {
      let hostId = await getHostId(gamePin);
      io.to(hostId).emit('sendStoryProgressToHost', id, story);
    });
  });
};

module.exports = socketEvents;
