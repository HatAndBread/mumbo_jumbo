const socket = io('/');

const hostButton = document.querySelector('.host_butt');
const pinDisplay = document.querySelector('.pin_display');
const shuffleButt = document.querySelector('.shuffle_butt');
let userPin;
let gamePin;

const gameData = {
  players: [],
  storiesRetrieved: 0,
  swapStories: function () {
    console.log(this.players);
  }
};

hostButton.addEventListener('click', () => {
  socket.emit('hostGetPin', socket.id);
});
shuffleButt.addEventListener('click', () => {
  socket.emit('shuffle', gamePin);
});
socket.on('gameCreated', (pin) => {
  pinDisplay.innerText = pin;
  gamePin = pin;
});
socket.on('newPlayer', (id, nickname) => {
  console.log('New player! ', id, nickname);
  gameData.players.push({ nickname: nickname, id: id, story: null });
  console.log(gameData.players);
});
socket.on('storySubmit', (data) => {
  console.log(data.id, data.story);
  gameData.players.map((el, index, arr) => {
    if (el.id === data.id) {
      arr[index].story = data.story;
      return;
    }
  });
  gameData.storiesRetrieved += 1;
  console.log(gameData.players, `stories retrieved: ${gameData.storiesRetrieved}`);
  if (gameData.storiesRetrieved === gameData.players.length) {
    //swapstories
    for (let i = 0; i < gameData.storiesRetrieved; i++) {
      gameData.players[i].story = gameData.players[i - 1].story; // this is wrong dummy
    }
    console.log(gameData.players, `stories retrieved: ${gameData.storiesRetrieved}`);
  } else {
    //ping missing players at interval until it works or until dropped from game
  }
});
