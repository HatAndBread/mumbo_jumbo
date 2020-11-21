const socket = io('/');

const hostButton = document.querySelector('.host_butt');
const pinDisplay = document.querySelector('.pin_display');
const shuffleButt = document.querySelector('.shuffle_butt');
const startButt = document.querySelector('.start_butt');
startButt.style.display = 'none';
shuffleButt.style.display = 'none';
const joinButt = document.querySelector('.join_butt');
let userPin;
let gamePin;

const gameData = {
  players: [],
  storiesRetrieved: 0,
  swapStories: function () {
    let first;
    for (let i = 0; i < this.players.length; i++) {
      if (i === 0) {
        first = this.players[i].story;
      }
      if (this.players[i + 1]) {
        this.players[i].story = this.players[i + 1].story;
      } else {
        this.players[i].story = first;
      }
    }
  }
};

hostButton.addEventListener('click', () => {
  socket.emit('hostGetPin', socket.id);
  hostButton.style.display = 'none';
  joinButt.style.display = 'none';
  startButt.style.display = 'initial';
});
shuffleButt.addEventListener('click', () => {
  socket.emit('shuffle', gamePin);
});
joinButt.addEventListener('click', () => {
  window.location = '/live';
});
startButt.addEventListener('click', () => {
  shuffleButt.style.display = 'initial';
  startButt.style.display = 'none';
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
    gameData.swapStories();
    socket.emit('distributeStories', gameData.players);
  } else {
    //ping missing players at interval until it works or until dropped from game
  }
});
