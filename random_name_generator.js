const Sentencer = require('sentencer');

const randomName = () => {
  let randomNumber = Math.floor(Math.random() * 2);
  if (randomNumber) {
    return Sentencer.make('{{ adjective }} {{ adjective }} {{ noun }}');
  }
  return Sentencer.make('{{ adjective }} {{ noun }} {{ noun }}');
};

module.exports = randomName;
