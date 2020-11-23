const socket = io('/');

const hostButton = document.querySelector('.host_butt');
const pinDisplay = document.querySelector('.pin_display');
const shuffleButt = document.querySelector('.shuffle_butt');
const startButt = document.querySelector('.start_butt');
const nicknameList = document.querySelector('.nickname_list');
const storyView = document.querySelector('.story_view');
const storyText = document.querySelector('.story_text');
const saveButt = document.querySelector('.save_butt');
const printButt = document.querySelector('.print_butt');
const explanation = document.querySelector('.explanation');
const disconnectText = document.querySelector('.disconnect_text');
const disconnectBox = document.querySelector('.disconnect_box');
const continueWithoutButt = document.querySelector('.continue_without_butt');
startButt.style.display = 'none';
shuffleButt.style.display = 'none';
const joinButt = document.querySelector('.join_butt');
let userPin;
let gamePin;

document.addEventListener('click', (e) => {
  e.target.id === 'story_view' || e.target.id === 'story_text' ? undefined : (storyView.style.top = '100vh');
});

const gameData = {
  players: [],
  storyUnderReview: '',
  storiesRetrieved: 0,
  disconnectedPlayerIds: [],
  swapStories: function () {
    this.storiesRetrieved = 0;
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
  hostButton.style.display = 'none';
  joinButt.style.display = 'none';
  startButt.style.display = 'initial';
  explanation.remove();
  socket.emit('hostGetPin', socket.id);
});
shuffleButt.addEventListener('click', () => {
  socket.emit('shuffle', gamePin);
});
joinButt.addEventListener('click', () => {
  window.location = '/live';
});
printButt.addEventListener('click', () => {
  let newWindow = window.open('', 'printwindow', 'status=1,width=300,height=250');
  newWindow.document.write('<html><head><title>Print Me</title></head>');
  newWindow.document.write('<body onafterprint="self.close()">');
  newWindow.document.write(`<p>${gameData.storyUnderReview}</p>`);
  newWindow.document.write('</body><script>window.print()</script></html>');
});
saveButt.addEventListener('click', async () => {
  const raw = await fetch('/random_word/sentence');
  const saveTitle = await raw.json();
  console.log(saveTitle);
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(gameData.storyUnderReview));
  element.setAttribute('download', saveTitle.word);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
});
startButt.addEventListener('click', () => {
  if (gameData.players.length > 0) {
    shuffleButt.style.display = 'initial';
    startButt.style.display = 'none';
    socket.emit('startingGame', gamePin);
  } else {
    alert('At least one writer must be signed in to start 😇✨');
  }
});
continueWithoutButt.addEventListener('click', () => {
  disconnectBox.style.right = '-300px';
  for (let i = 0; i < gameData.players.length; i++) {
    for (let j = 0; j < gameData.disconnectedPlayerIds; j++) {
      if (gameData.players[i].id === gameData.disconnectedPlayerIds[j]) {
        gameData.players.splice(i, 1);
        console.log('game data players: ', gameData.players);
        gameData.disconnectedPlayerIds.splice(j, 1);
        let node = document.getElementById(gameData.players[i].id);
        node.parentNode.removeChild(node);
        break;
      }
    }
  }
});
socket.on('gameCreated', (pin) => {
  pinDisplay.innerText = pin;
  gamePin = pin;
});
socket.on('newPlayer', (id, nickname) => {
  console.log('New player! ', id, nickname);
  gameData.players.push({ nickname: nickname, id: id, story: null });
  const item = document.createElement('li');
  const node = document.createTextNode(`⭐️${nickname}`);
  item.appendChild(node);
  item.addEventListener('click', () => {
    console.log(nickname);
    socket.emit('retrieveStoryProgress', id);
  });
  item.id = id;
  nicknameList.appendChild(item);
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
socket.on('sendStoryProgressToHost', (id, story) => {
  gameData.storyUnderReview = story;
  storyText.innerText = story;
  storyView.style.top = '50vh';
});
socket.on('playerDisconnected', (name, id) => {
  gameData.disconnectedPlayerIds.push(id);
  console.log(`ON NO ${name} disconnected! id: ${id}`);
  continueWithoutButt.innerText = `Continue without ${name}`;
  disconnectText.innerText = `Oh no! ${name} disconnected! 😢`;
  disconnectBox.style.right = '0px';
});
