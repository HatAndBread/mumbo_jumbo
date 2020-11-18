const express = require('express');
const host = express.Router();

host.post('/', (req, res) => {
  console.log('I got a request!');
});

module.exports = host;
