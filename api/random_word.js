const express = require('express');
const router = express.Router();
const sentencer = require('sentencer');

router.get('/:type', (req, res) => {
  console.log(req.params);
  if (req.params.type === 'adjective') {
    res.send({ word: sentencer.make('{{adjective}}') });
  }
  if (req.params.type === 'noun') {
    res.send({ word: sentencer.make('{{noun}}') });
  }
});

module.exports = router;
