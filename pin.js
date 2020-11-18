const express = require('express');
const router = express.Router();
const pinMaker = require('./pin_maker');

router.get('/', async (req, res) => {
  const pin = await pinMaker();
  console.log(`THE PIN PIN PIN PIN ${pin}`);
  res.send({ pin: pin });
});

module.exports = router;
