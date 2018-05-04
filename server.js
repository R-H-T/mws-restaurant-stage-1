const fs = require('fs');
const path = require('path');
const app = require('express')();
const server = require('http').Server(app);
const wss = new(require("ws").Server)({ server, path: '/updates' });

const dataFilePath = path.join(__dirname, 'data/restaurants.json');
const port = 8181;

console.log('Starting server...');

app
  .use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  })
  .get('/', (request, response) => {
    response.status(404).send('404 - Not found');
  })
  .get('/restaurants', (request, response) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    response.sendFile(path.resolve(dataFilePath), { maxAge: 0 });
  })
  .get('/restaurants/:id', (request, response) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    const id = Number.parseInt(encodeURI(request.params.id));
    if (Object.is(id, NaN)) { response.status(400).send('400 - Bad request'); return; }
    const { restaurants = null } = JSON.parse(fs.readFileSync(dataFilePath));
    const restaurant = restaurants.filter(restaurant => (restaurant.id === id))[0] || null;
    if (!restaurant) { response.status(404).send('404 - Not found'); return; }
    response.send(restaurant);
  });

wss.on('connection', socket => {
  console.log('Connecting socket...');
  let sendNow = [];

  socket.on('open', () => {
    console.log('socket opening...');
  });

  socket.on('close', () => {
    console.log('socket closing...');
  });

  socket.on('message', message => {
    console.log('Message received: %s', message);
    if (message.type === 'utf8') {
      sendNow.push(message);
    }
  });

  if (sendNow.length) {
    socket.send(JSON.stringify(sendNow));
  }
});

server.listen(port);
