const sqlite = require('sqlite3').verbose();
const EventEmitter = require('events');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
const handlePin = require('./socket_handlers/pin');
const hostGamePin = require('./socket_handlers/host_game_pin');
const host = require('./host');
app.use('/host', host);
const pinMaker = require('./pin_maker');

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('a user connected');
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
  socket.on('turnInStory', (id, story) => {
    console.log('REtrieved story! player id: ', id);
    console.log('REtrieved story! story: ', story);
  });
});

app.get('/', (req, res) => {
  res.render('index.html');
});

//ERASES GAMES MORE THAN A DAY OLD FROM DB

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();
emitter.on('tableCreated', () => {
  pinMaker(Math.random()); // GENERATE PIN. DELETE ME!!!!
  setInterval(function () {
    const db = new sqlite.Database('./games.db');
    db.run(/*sql*/ `DELETE FROM active_games WHERE date < ?`, [Date.now() - 1000 * 60 * 60 * 24], function (err) {
      err && console.log(err);
      console.log(`Cleaned ${this.changes} old games from the database`);
    });
    db.close();
  }, 100000);
});
module.exports = { emitter: emitter };
const createTable = require('./create_table');
createTable();

server.listen(PORT, () => {
  console.log(`Listening to port ${PORT}👯‍♀️`);
});
