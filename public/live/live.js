const socket = io('/');

const joinButton = document.querySelector('.join_butt');
const nounButt = document.querySelector('.noun_butt');
const nameButt = document.querySelector('.name_butt');
const placeButt = document.querySelector('.place_butt');
const adverbButt = document.querySelector('.adverb_butt');
const adjectiveButt = document.querySelector('.adjective_butt');
const intransitiveButt = document.querySelector('.intransitive_butt');
const transitiveButt = document.querySelector('.transitive_butt');
const pinForm = document.querySelector('.pin_form');
const pinInput = document.querySelector('.pin_input');
const rejoinLink = document.querySelector('.rejoin_link');
const rejoinBox = document.querySelector('.rejoin_box');
const rejoinCloser = document.querySelector('.rejoin_closer');
const rejoinButt = document.querySelector('.rejoin_butt');
const rejoinForm = document.querySelector('.rejoin_form');
const rejoinPinInput = document.getElementById('rejoin_pin_input');
const rejoinNicknameInput = document.getElementById('rejoin_nickname_input');

pinInput.focus();
pinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  submitPin();
});
const writingToolsButt = document.querySelector('.writing_tools_butt');
const closeButt = document.querySelector('.close_butt');
const storyInput = document.querySelector('.story_input');
const nicknameDisplay = document.querySelector('.nickname_display');
const controlButts = document.querySelector('.control_butts');
storyInput.style.display = 'none';
writingToolsButt.style.display = 'none';

const data = {
  gamePin: null,
  story: '',
  nickname: '',
  hostId: null,
  rejoinNickname: null,
  rejoinPin: null,
  updater: 0
};

const getWord = async (type) => {
  const res = await fetch(`/random_word/${type}`);
  let word = await res.json();
  word = word.word;
  data.story[data.story.length - 1] === ' ' ? (data.story += word) : (data.story += ' ' + word);
  storyInput.value = data.story;
};

const submitPin = () => {
  joinButton.style.display = 'none';
  socket.emit('submitPin', data.gamePin, socket.id);
};
joinButton.addEventListener('click', submitPin);
nounButt.addEventListener('click', () => {
  getWord('noun');
});
adjectiveButt.addEventListener('click', () => {
  getWord('adjective');
});
placeButt.addEventListener('click', () => {
  getWord('place');
});
nameButt.addEventListener('click', () => {
  getWord('name');
});
adverbButt.addEventListener('click', () => {
  getWord('adverb');
});
intransitiveButt.addEventListener('click', () => {
  getWord('intransitive');
});
transitiveButt.addEventListener('click', () => {
  getWord('transitive');
});
pinInput.addEventListener('input', (e) => {
  data.gamePin = e.target.value;
});
storyInput.addEventListener('input', (e) => {
  data.updater += 1;
  data.story = e.target.value;
  console.log(data.story);
  if (data.updater >= 10) {
    socket.emit('updateMyStory', data.story, socket.id, data.gamePin);
    data.updater = 0;
  }
});
closeButt.addEventListener('click', () => {
  controlButts.style.right = '-250px';
});
writingToolsButt.addEventListener('click', () => {
  console.log('clicked!');
  controlButts.style.right = '0px';
});

rejoinCloser.addEventListener('click', () => {
  rejoinBox.style.top = '-260px';
});
rejoinLink.addEventListener('click', () => {
  rejoinBox.style.top = '40vh';
  rejoinPinInput.focus();
});
rejoinButt.addEventListener('click', () => {
  rejoinBox.style.top = '-260px';
});
rejoinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!data.rejoinNickname || !data.rejoinPin) {
    alert('Please enter a valid nickname and story pin number');
  } else {
    socket.emit('rejoinAfterLogout', data.rejoinPin, data.rejoinNickname, socket.id);
  }
});
rejoinNicknameInput.addEventListener('input', (e) => {
  data.rejoinNickname = e.target.value;
  console.log(data.rejoinNickname);
});
rejoinPinInput.addEventListener('input', (e) => {
  data.rejoinPin = e.target.value;
  console.log(data.rejoinPin);
});

socket.on('notExist', () => {
  alert("That game doesn't exist. Please try again. 😭");
  joinButton.style.display = 'initial';
});
socket.on('pinOK', (nickname, hostId) => {
  console.log('PIN ACCEPTED');
  data.nickname = nickname;
  data.hostId = hostId;
  nicknameDisplay.innerText = `Your username is: ${nickname}`;
  joinButton.style.display = 'none';
  pinInput.style.display = 'none';
});
socket.on('joinedStartedGame', (nickname, hostId) => {
  console.log('YOOOOOOOOOO STARTED GAME');
  data.nickname = nickname;
  data.hostId = hostId;
  nicknameDisplay.innerText = `Your username is: ${nickname}`;
  joinButton.style.display = 'none';
  pinInput.style.display = 'none';
  writingToolsButt.style.display = 'initial';
  storyInput.style.display = 'initial';
  storyInput.focus();
  controlButts.style.display = 'flex';
  controlButts.style.flexDirection = 'column';
});
socket.on('retrieveStory', () => {
  socket.emit('turnInStory', socket.id, data.story, data.gamePin, data.hostId);
});
socket.on('newStory', (story) => {
  console.log('this is your new story!: ', story);
  data.story = story;
  storyInput.value = story;
});
socket.on('startWriting', () => {
  writingToolsButt.style.display = 'initial';
  storyInput.style.display = 'initial';
  storyInput.focus();
  controlButts.style.display = 'flex';
  controlButts.style.flexDirection = 'column';
});
socket.on('retrieveStoryProgress', () => {
  socket.emit('sendStoryProgressToHost', socket.id, data.story, data.gamePin);
});
const onRelogin = (pin, nickname, playerId, hostId) => {
  console.log('Yay I logged back in');
  data.nickname = nickname;
  data.playerId = playerId;
  data.gamePin = pin;
  data.hostId = hostId;
  data.rejoinNickname = null;
  data.rejoinPin = null;
  nicknameDisplay.innerText = `Your username is: ${nickname}`;
  joinButton.style.display = 'none';
  pinInput.style.display = 'none';
};
socket.on('relogin', (pin, nickname, playerId, hostId) => {
  onRelogin(pin, nickname, playerId, hostId);
});
socket.on('reloginStarted', (pin, nickname, playerId, hostId, story) => {
  onRelogin(pin, nickname, playerId, hostId);
  writingToolsButt.style.display = 'initial';
  storyInput.style.display = 'initial';
  data.story = story;
  storyInput.innerText = story;
  storyInput.focus();
  controlButts.style.display = 'flex';
  controlButts.style.flexDirection = 'column';
});
socket.on('errorRelogin', () => {
  alert('Unable to log in. Please try again. 🌈');
});

document.addEventListener('click', (e) => {
  if (e.target.value !== 'tools') {
    controlButts.style.right = '-250px';
    storyInput.focus();
  }
});
