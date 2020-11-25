const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
const socketEvents = require('./socket_handlers/socket_events');
const cleanDb = require('./db/clean_db').cleanDb;
const host = require('./host');
const randomWord = require('./api/random_word');
app.use('/host', host);
app.use('/random_word', randomWord);

const server = require('http').createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

socketEvents(io);

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/live', (req, res) => {
  res.render('index.html');
});

cleanDb();
const createTable = require('./db/create_table');
createTable();

server.listen(PORT, () => {
  console.log(`Listening to port ${PORT}👯‍♀️`);
});
