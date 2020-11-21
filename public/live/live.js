const socket = io('/');

const joinButton = document.querySelector('.join_butt');
const nounButt = document.querySelector('.noun_butt');
const adjectiveButt = document.querySelector('.adjective_butt');
const pinInput = document.querySelector('.pin_input');
const storyInput = document.querySelector('#story_input');

const data = {
  gamePin: null,
  story: ''
};
let gamePin;
let story = '';

joinButton.addEventListener('click', () => {
  socket.emit('submitPin', data.gamePin, socket.id);
});
nounButt.addEventListener('click', async () => {
  const res = await fetch('/random_word/noun');
  let word = await res.json();
  word = word.word;
  data.story[data.story.length - 1] === ' ' ? (data.story += word) : (data.story += ' ' + word);
  storyInput.value = data.story;
});
adjectiveButt.addEventListener('click', async () => {
  const res = await fetch('/random_word/adjective');
  let word = await res.json();
  word = word.word;
  data.story[data.story.length - 1] === ' ' ? (data.story += word) : (data.story += ' ' + word);
  storyInput.value = data.story;
});
pinInput.addEventListener('input', (e) => {
  data.gamePin = e.target.value;
});
storyInput.addEventListener('input', (e) => {
  data.story = e.target.value;
  console.log(data.story);
});
socket.on('notExist', () => {
  alert("That game doesn't exist. Please try again. 😭");
});
socket.on('pinOK', (nickname) => {
  console.log('Yay! it worked! Your nickname is ' + nickname);
});
socket.on('retrieveStory', () => {
  socket.emit('turnInStory', socket.id, data.story, data.gamePin);
});
socket.on('newStory', (story) => {
  console.log('this is your new story!: ', story);
  data.story = story;
  storyInput.value = story;
});
