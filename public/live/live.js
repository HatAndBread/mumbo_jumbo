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
  story: ''
};
let gamePin;
let story = '';

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
  data.story = e.target.value;
  console.log(data.story);
});
closeButt.addEventListener('click', () => {
  controlButts.style.right = '-250px';
});
writingToolsButt.addEventListener('click', () => {
  console.log('clicked!');
  controlButts.style.right = '0px';
});
socket.on('notExist', () => {
  alert("That game doesn't exist. Please try again. 😭");
  joinButton.style.display = 'initial';
});
socket.on('pinOK', (nickname) => {
  console.log('Yay! it worked! Your nickname is ' + nickname);
  nicknameDisplay.innerText = `Your username is: ${nickname}`;
  joinButton.style.display = 'none';
  pinInput.style.display = 'none';
});
socket.on('retrieveStory', () => {
  socket.emit('turnInStory', socket.id, data.story, data.gamePin);
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

document.addEventListener('click', (e) => {
  if (e.target.value !== 'tools') {
    controlButts.style.right = '-250px';
    storyInput.focus();
  }
});
