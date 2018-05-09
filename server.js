const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
webpackConfig.mode = 'production';
const compiler = webpack(webpackConfig);
const webpackDevMiddleware = require('webpack-dev-middleware');
const app = require('express')();
const server = require('http').Server(app);
const https = require('https');
const ws = new(require('ws').Server)({ server, path: '/updates' });
const compression = require('compression');

const dataFilePath = path.join(__dirname, 'data/restaurants.json');
const url_protocol = 'http';
const url_host = 'localhost'
const server_url_port = 8181;
const fullUrlPath = (port = server_url_port, host = url_host, protocol = url_protocol) => `${protocol}://${host}${(port) ? `:${port}` : '' }`;

const secureServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'ssl-cert/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl-cert/cert.pem'))
}, app).listen(8443, () => {
  console.log(`HTTPS – Listening to port ${ 8443 }`);
});
const wss = new(require('ws').Server)({ server: secureServer, path: '/updates' });
console.log(`Starting server at ${ fullUrlPath(null) }...`);
app.use(compression());
app.use(webpackDevMiddleware(compiler, { publicPath: '/' }));
app.use(require("webpack-hot-middleware")(compiler));
app
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
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

const handleSocket = socket => {
  console.log('Connecting to socket...');
  let sendNow = [];

  socket.on('open', () => {
    console.log('– socket open');
  });

  socket.on('close', () => {
    console.log('– socket closed');
  });

  socket.on('message', message => {
    console.log(`– message received: "${message}"`);
    if (message.type === 'utf8') {
      sendNow.push(message);
    }
  });
  const sendNowLength = sendNow.length;
  if (sendNowLength) {
    console.log(`– sending ${`sending ${sendNowLength} message${((sendNowLength > 1) ? 's' : '')}`}`);
    socket.send(JSON.stringify(sendNow));
  }
};

ws.on('connection', handleSocket);
wss.on('connection', handleSocket);

server.listen(server_url_port, () => {
  console.log(`HTTP – Listening to port ${ server_url_port }`);
});
