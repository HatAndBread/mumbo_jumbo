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
const pin = require('./pin');
const host = require('./host');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
app.use('/pin', pin);
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
});

app.get('/', (req, res) => {
  res.render('index.html');
});

app.post('/', (req, res) => {
  if (req.body.type === 'pin') {
    //check if game valid
    console.log(req.body);
    res.send({ ok: true });
  } else if (req.body.type === 'name') {
    console.log(req.body);
    res.send({ ok: true });
  } else {
    console.log('unthinkable error');
  }
});

//ERASES GAMES MORE THAN A DAY OLD FROM DB

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();
emitter.on('tableCreated', () => {
  console.log('HI!');
  pinMaker(); // GENERATE PIN. DELETE ME!!!!
  setInterval(function () {
    const db = new sqlite.Database('./games.db');
    db.run(/*sql*/ `DELETE FROM active_games WHERE date < ?`, [Date.now() - 1000 * 60 * 60 * 24], function (err) {
      err && console.log(err);
      console.log(`Cleaned ${this.changes} old games from the database`);
    });
    db.close();
  }, 10000);
});
module.exports = { emitter: emitter };
const createTable = require('./create_table');
createTable();

server.listen(PORT, () => {
  console.log(`Listening to port ${PORT}👯‍♀️`);
});
