const socket = io('/');

const joinButton = document.querySelector('.join_butt');
const pinInput = document.querySelector('.pin_input');
const storyInput = document.querySelector('#story_input');

let gamePin;
let story = '';

joinButton.addEventListener('click', () => {
  socket.emit('submitPin', gamePin, socket.id);
});
pinInput.addEventListener('input', (e) => {
  gamePin = e.target.value;
  console.log(gamePin);
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
socket.on('retrieveStory', () => {
  socket.emit('turnInStory', socket.id, story, gamePin);
});
