'use strict';

const SERVER_ENDPOINT = 'http://localhost:5001';

const socket = io(SERVER_ENDPOINT);

const ui = {
  connect: (location) => {
    console.log(`Connected to ${location}`);
  },
  disconnect: (reason) => {
    console.info('Disconnected from server. Reason ->', reason)
  },
  message: (body) => {
    console.log(`> ${body}`)
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
    body: message
  })
}

const Conch = {
  say: send
}