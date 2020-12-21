'use strict';

const CONCH_PREFIX = '--conch';
const SERVER_ENDPOINT = 'http://localhost:5001';
const socket = io(SERVER_ENDPOINT);

const getStyles = (type = 'msg') => {
  const styleString = getComputedStyle(document.documentElement).getPropertyValue(`${CONCH_PREFIX}-${type}`)
  return styleString.slice(1, -1);
}

const introChip = () => {
  if (!!document.querySelector(`.${CONCH_PREFIX}-logo`)) return;
  
  const target = document.body;
  const chip = document.createElement('span');
  const icon = document.createElement('span');
  
  chip.classList.add(`${CONCH_PREFIX}-logo`);
  
  icon.innerText = '🐚';
  chip.setAttribute('style', STYLES.INTRO_CHIP);
  icon.setAttribute('style', STYLES.INTRO_ICON);
  
  chip.appendChild(icon);
  target.appendChild(chip);
  
  setTimeout(() => {
    chip.style.opacity = 0;
  }, 2000);
}

const assignName = (name) => {
  
}

const STYLES = {
  INTRO_CHIP: getStyles('logo'),
  INTRO_ICON: getStyles('logo-icon'),
  MSG_NAME: getStyles('username'),
  MSG_INFO: getStyles('info-msg'),
  MSG_MSG: getStyles()
}

const ui = {
  connect: (location) => {
    console.log(`Connected to ${location}`);
  },
  disconnect: (reason) => {
    console.info('Disconnected from server. Reason ->', reason)
  },
  message: (body, prefix, infoStyle = `MSG_NAME`, messageStyle = `MSG_MSG`) => {
    if (!prefix) prefix = socket.id;
    console.log(`%c${prefix} %c${body}`, STYLES[infoStyle], STYLES[messageStyle])
  },
}

socket.on("connect", () => {
  introChip();
  ui.connect(SERVER_ENDPOINT);
  console.log(`UID: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  ui.disconnect(reason)
})

socket.on("message", (message) => {
  ui.message(message.body)
})

socket.on("namechange", (name) => {
  ui.message(`${name.body}`, `NC:`, `MSG_INFO`);
})

const send = (message) => {
  socket.emit('message', {
    body: `${message}`
  })
}

const setName = (name) => {
  assignName(name);
  socket.emit('namechange', {
    body: name
  })
}

const Conch = {
  say: send,
  setName
}