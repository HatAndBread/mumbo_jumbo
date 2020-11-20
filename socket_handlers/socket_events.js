const handlePin = require('./pin');
const hostGamePin = require('./host_game_pin');
const getHostId = require('../db/db_query').getHostId;

const socketEvents = (io) => {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log('user disconnected');
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
      hostId = await getHostId(gamePin);
      console.log('Got the host id!: ', hostId);
      io.to(hostId).emit('storySubmit', { id: id, story: story });
    });
    socket.on('distributeStories', (players) => {
      console.log('new story distribution!', players[0].story, players[1].story);
      players.forEach((player) => {
        io.to(player.id).emit('newStory', player.story);
      });
    });
  });
};

module.exports = socketEvents;
