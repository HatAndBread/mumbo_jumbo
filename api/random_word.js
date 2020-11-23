const express = require('express');
const router = express.Router();
const c = require('chinpunkanpun');

router.get('/:type', (req, res) => {
  if (req.params.type === 'adjective') {
    res.send({ word: c.getWord(c.adjective) });
  } else if (req.params.type === 'noun') {
    let rand = Math.floor(Math.random() * 2);
    rand ? (rand = c.getWord(c.singularNoun)) : (rand = c.getWord(c.uncountableNoun));
    res.send({ word: rand });
  } else if (req.params.type === 'adverb') {
    res.send({ word: c.getWord(c.adverb) });
  } else if (req.params.type === 'place') {
    res.send({ word: c.getWord(c.place) });
  } else if (req.params.type === 'name') {
    res.send({ word: c.getWord(c.person) });
  } else if (req.params.type === 'intransitive') {
    res.send({ word: c.getWord(c.simplePluralIntransitive) });
  } else if (req.params.type === 'transitive') {
    res.send({ word: c.getWord(c.simplePluralTransitive) });
  } else {
    res.send({ word: c.sentence() });
  }
});

module.exports = router;
