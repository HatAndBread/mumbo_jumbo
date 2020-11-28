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
  rejoinPin: '',
  rejoinNickname: '',
  rejoinButtGarbage: [],
  nicknameListButtons: [],
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
    socket.emit('startingGame', gamePin, gameData.players);
  } else {
    alert('At least one writer must be signed in to start 😇✨');
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
  gameData.nicknameListButtons.push(item);
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
    socket.emit('distributeStories', gameData.players, gamePin);
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
  console.log(gameData.disconnectedPlayerIds, ' disconnected');
  disconnectText.innerText = `Oh no! ${name} disconnected! 😢`;
  disconnectBox.style.right = '0px';
  const butt = document.createElement('button');
  butt.innerText = `Continue without ${name}`;
  butt.id = name;
  butt.addEventListener('click', () => {
    gameData.disconnectedPlayerIds.length === 1 ? (disconnectBox.style.right = '-300px') : null;
    for (let i = 0; i < gameData.players.length; i++) {
      if (gameData.players[i].id === id) {
        let nicknameDisplay = document.getElementById(gameData.players[i].id);
        gameData.players.splice(i, 1);
        gameData.disconnectedPlayerIds.splice(gameData.disconnectedPlayerIds.indexOf(id), 1);
        console.log(
          'game data players: ',
          gameData.players,
          'gameData disconnected players: ',
          gameData.disconnectedPlayerIds
        );
        disconnectBox.removeChild(butt);
        nicknameDisplay.parentNode.removeChild(nicknameDisplay);
        socket.emit('deleteDisconnectedPlayer', gamePin, id);
        break;
      }
    }
  });
  gameData.rejoinButtGarbage.push(butt);
  disconnectBox.appendChild(butt);
});
socket.on('relogin', (nickname, playerId) => {
  console.log(`${nickname} has logged back in with id ${playerId}`);
  for (let i = 0; i < gameData.players.length; i++) {
    let oldId = gameData.players[i].id;
    if (gameData.players[i].nickname === nickname) {
      for (let j = 0; j < gameData.rejoinButtGarbage.length; j++) {
        if (gameData.rejoinButtGarbage[j].id === nickname) {
          disconnectBox.removeChild(gameData.rejoinButtGarbage[j]);
          disconnectText.innerText = '';
          gameData.rejoinButtGarbage.splice(j, 1);
          break;
        }
      }
      for (let j = 0; j < gameData.disconnectedPlayerIds.length; j++) {
        if (gameData.disconnectedPlayerIds[j] === oldId) {
          gameData.disconnectedPlayerIds.splice(j, 1);
          break;
        }
      }
      gameData.nicknameListButtons.map((el, index, arr) => {
        if (el.id === oldId) {
          el.parentNode.removeChild(el);
          arr.splice(index, 1);
        }
      });
      gameData.players[i].id = playerId;
      gameData.disconnectedPlayerIds.length === 0 ? (disconnectBox.style.right = '-300px') : null;
      const item = document.createElement('li');
      const node = document.createTextNode(`⭐️${nickname}`);
      item.appendChild(node);
      item.addEventListener('click', () => {
        socket.emit('retrieveStoryProgress', playerId);
      });
      item.id = playerId;
      gameData.nicknameListButtons.push(item);
      nicknameList.appendChild(item);
      console.log(gameData);
      break;
    }
  }
});
socket.on('keepAliveReceived', () => {
  console.log('staying alive');
});

setInterval(() => {
  socket.emit('keepAlive', 'host', gamePin, null);
}, 2000);
