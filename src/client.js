'use strict';

const SERVER_ENDPOINT = 'http://localhost:5001';
const socket = io(SERVER_ENDPOINT);

const getStyles = (type = 'msg') => {
  const styleString = getComputedStyle(document.documentElement).getPropertyValue(`--conch-${type}`)
  return styleString.slice(1, -1);
}

const ui = {
  connect: (location) => {
    console.log(`Connected to ${location}`);
  },
  disconnect: (reason) => {
    console.info('Disconnected from server. Reason ->', reason)
  },
  message: (body) => {
    const nameStyle = getStyles('username')
    const msgStyle = getStyles()
    console.log(`%c${socket.id} %c${body}`, nameStyle, msgStyle)
  }
}

socket.on("connect", () => {
  ui.connect(SERVER_ENDPOINT)
  console.log(`UID: ${socket.id}`);
});

socket.on("disconnect", (reason) => {
  ui.disconnect(reason)
})

socket.on("message", (message) => {
  ui.message(message.body)
})

const send = (message) => {
  socket.emit('message', {
    body: `${message}`
  })
}

const Conch = {
  say: send
}