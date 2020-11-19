const socket = io('/');

const hostButton = document.querySelector('.host_butt');
const joinButton = document.querySelector('.join_butt');
const pinDisplay = document.querySelector('.pin_display');
const pinInput = document.querySelector('.pin_input');
const shuffleButt = document.querySelector('.shuffle_butt');
const storyInput = document.querySelector('#story_input');
let userPin;
let gamePin;
let story = '';

const pinInputChange = hostButton.addEventListener('click', async () => {
  socket.emit('hostGetPin', socket.id);
});
joinButton.addEventListener('click', () => {
  socket.emit('submitPin', userPin, socket.id);
});
shuffleButt.addEventListener('click', () => {
  socket.emit('shuffle', gamePin);
});
pinInput.addEventListener('input', (e) => {
  userPin = e.target.value;
  console.log(userPin);
});
storyInput.addEventListener('input', (e) => {
  story = e.target.value;
  console.log(story);
});
socket.on('notExist', () => {
  alert("That game doesn't exist. Please try again. 😭");
});
socket.on('pinOK', (nickname) => {
  console.log('Yay! it worked! Your nickname is ' + nickname);
});
socket.on('gameCreated', (pin) => {
  pinDisplay.innerText = pin;
  gamePin = pin;
});
socket.on('retrieveStory', () => {
  console.log('GIVE THE STORR!!!!!!');
  socket.emit('turnInStory', socket.id, story);
});
socket.on('newPlayer', (pin, nickname) => {
  console.log('New player! ', pin, nickname);
});
