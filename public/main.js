const hostButton = document.querySelector('.host_butt');
const pinDisplay = document.querySelector('.pin_display');
const getPin = async () => {
  const raw = await fetch('/pin');
  console.log(raw);
  const pin = await raw.json();
  console.log(pin);
  pinDisplay.innerText = pin;
};
hostButton.addEventListener('click', getPin);
console.log(hostButton);
