'use strict';

const CONCH_PREFIX = '--conch';
const SERVER_ENDPOINT = 'http://localhost:5001';
const socket = io(SERVER_ENDPOINT);

const getStyles = (type = 'msg') => {
  const styleString = getComputedStyle(document.documentElement).getPropertyValue(`${CONCH_PREFIX}-${type}`)
  return styleString.slice(1, -1);
}

const connectedChip = () => {
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
  const uidSet = window.localStorage[`${CONCH_PREFIX}-uid`] !== undefined;
  if (name) {
    window.localStorage[`${CONCH_PREFIX}-name`] = name
    if (!uidSet) window.localStorage[`${CONCH_PREFIX}-uid`] = uniqueId()
  } else {
    return {
      name: window.localStorage[`${CONCH_PREFIX}-name`],
      uid: window.localStorage[`${CONCH_PREFIX}-uid`]
    };
  }
}

const getUserProfile = () => {
  const name = window.localStorage[`${CONCH_PREFIX}-name`];
  const uid = window.localStorage[`${CONCH_PREFIX}-uid`];
  return { name, uid }
}

const uniqueId = () => {
  const a = new Uint32Array(4);
  window.crypto.getRandomValues(a);
  return (
    performance.now().toString(36)+Array.from(a).map(
      A => A.toString(36)
    ).join("")
  ).replace(/\./g,"");
}

const STYLES = {
  INTRO_CHIP: getStyles('logo'),
  INTRO_ICON: getStyles('logo-icon'),
  INFO_ERR: getStyles('info-err'),
  INTRO: getStyles('intro'),
  MSG_NAME: getStyles('username'),
  MSG_INFO: getStyles('info-msg'),
  MSG_MSG: getStyles()
}

const ui = {
  connect: (location) => {
    runCode(false);
    let commands = [
      { method: 'say(string, ?object)', description: 'Send a message' },
      { method: 'setName(string)', description: 'Set your name' },
      { method: 'getUsers()', description: 'See who is online' } ,
      { method: 'runCode(boolean)', description: 'Sets messages to run attached code when received' }
    ]

    connectedChip();
    
    ui.message(
      `Conch is ready. Commands are below. (${location})`,
      '🐚', "INTRO", ''
    );
    
    console.dir(
      commands,
      '🐚', "INTRO", ''
    );
  },
  disconnect: (reason) => {
    ui.message(
      `Disconnected from server. (${reason ?? 'Unknown cause'})`,
      '🐚', "INFO_ERR"
    )
  },
  message: (body, prefix, infoStyle = `MSG_NAME`, messageStyle = `MSG_MSG`) => {
    if (!prefix) { prefix = assignName().name ?? socket.id};
    console.log(`%c${prefix} %c${body}`, STYLES[infoStyle], STYLES[messageStyle])
  },
}

// Connected to server
socket.on("connect", () => {
  
  const { name, uid } = getUserProfile();
  
  socket.emit('ident', {
    body: { name, uid }
  });
  
  ui.connect(SERVER_ENDPOINT);
  
  const username = assignName().name;
  username !== undefined ? ui.message(`Name: ${username}`) : ui.message(`UID: ${socket.id}`)
});

// Disconnected from server
socket.on("disconnect", (reason) => {
  ui.disconnect(reason)
})

// Message from server
socket.on("message", (message) => {
  if (message.message.user?.uid !== getUserProfile().uid) {
    ui.message(
      `${message.message.body}`,
      `${message.message.user?.name || message.socketId}`
    )
    if (eval(runCode()) && message.message?.code) {
      eval(message.message.code)
    }
  } else {
    ui.message('','📤', "INFO", '')
  }
})

// User joined server
socket.on("join", (user) => {
  if (user.uid !== getUserProfile().uid) {
    const name = user?.name ?? `Anonymous`
    ui.message(`${name} joined`, `👋`);
  }
})

// User left
socket.on("leave", (user) => {
  if (user.uid !== getUserProfile().uid) {
    const name = user.name ?? `Anonymous`
    ui.message(`${name} left`, `👋`);
  }
})

// User changed name
socket.on("namechange", (userProfile) => {
  ui.message(`${userProfile.body.name}`, `NC:`, `MSG_INFO`);
})

socket.on("userlist", (users) => {
  ui.message(
    'USERS LIST',
    '🐚',
    'MSG_MSG'
  )
  users.forEach((user) => ui.message(
    `${user.name ?? `Anonymous`}`,
    user.online ? '🟢' : '🔴'
  ));
})

const send = (message, codePayload) => {
  socket.emit('message', {
    body: `${message}`,
    user: getUserProfile(),
    code: `${codePayload}`
  })
}

const setName = (username) => {
  if (!username) return;
  assignName(username);
  
  const { name, uid } = getUserProfile();
  
  socket.emit('namechange', {
    body: {
      name,
      uid
    }
  })
}

const getUsers = () => {
  socket.emit('rolecall');
}

const runCode = (shouldRun) => {
  if (typeof shouldRun === "boolean") {
    window.localStorage[`${CONCH_PREFIX}-runcode`] = !!shouldRun
  } else {
    return window.localStorage[`${CONCH_PREFIX}-runcode`];
  }
}

const Conch = {
  say: send,
  setName,
  getUsers,
  runCode
}