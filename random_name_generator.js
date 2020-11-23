const c = require('chinpunkanpun');

const randomName = () => {
  let randomNumber = Math.floor(Math.random() * 2);
  if (randomNumber) {
    return `${c.getWord(c.adjective)} ${c.getWord(c.adjective)} ${c.getWord(c.singularNoun)}`;
  }
  return `${c.getWord(c.adjective)} ${c.getWord(c.uncountableNoun)}`;
};

module.exports = randomName;
