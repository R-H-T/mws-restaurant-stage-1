const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
webpackConfig.mode = 'production';
const compiler = webpack(webpackConfig);
const webpackDevMiddleware = require('webpack-dev-middleware');
const app = require('express')();
const http = require('http');
const server = http.Server(app);
const https = require('https');
const ws = new(require('ws').Server)({
  server,
  path: '/updates'
});
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
const wss = new(require('ws').Server)({
  server: secureServer,
  path: '/updates'
});
console.log(`Starting server at ${ fullUrlPath(null) }...`);
app.use(compression());
app.use(webpackDevMiddleware(compiler, {
  publicPath: '/'
}));
app.use(require("webpack-hot-middleware")(compiler));

const createRequestOptions = (req, path) => ({
    protocol: 'http:',
    host: '127.0.0.1',
    port: 1337,
    path,
    method: 'GET',
    headers: req.headers
});

app
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  })
  .get('/', (req, res) => {
    req(404).send('404 - Not found');
  })
  .get('/restaurants', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'application/json');

    const options = createRequestOptions(req, '/restaurants');

    var creq = http.request(options, cres => {

      // set encoding
      cres.setEncoding('utf8');

      var chunks = '';

      // wait for data
      cres.on('data', chunk => {
        res.setHeader('Content-Type', 'application/json');
        // res.write(chunk);
        chunks += chunk;
      });

      cres.on('close', () => {
        res.end();
      });

      cres.on('end', () => {
        const restaurants = JSON.parse(chunks);
        res.write(JSON.stringify({
          restaurants
        }));
        res.end();
      });

    }).on('error', e => {
      console.log(e.message);
      res.end();
    });

    creq.end();
  })
  .get('/restaurants/:id', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Content-Type', 'application/json');

    const id = req.params.id;

    if (Object.is(parseInt(id), NaN)) {
      res.status(400).send(`400 - Bad request`);
      return;
    }

    // const options = createRequestOptions(req, `/reviews?restaurant_id=${ id }`);

    const options = createRequestOptions(req, `/restaurants/${ id }`);

    var creq = http.request(options, cres => {

      // set encoding
      cres.setEncoding('utf8');

      var chunks = '';

      // wait for data
      cres.on('data', chunk => {
        res.setHeader('Content-Type', 'application/json');
        // res.write(chunk);
        chunks += chunk;
      });

      cres.on('close', () => {
        res.end();
      });

      cres.on('end', () => {
        const restaurant = JSON.parse(chunks);
        res.write(JSON.stringify({
          restaurant
        }));
        res.end();
      });

    }).on('error', e => {
      console.log(e.message);
      res.end();
    });

    creq.end();
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
    console.log(`– message received: "${ message }"`);
    if (message.type === 'utf8') {
      sendNow.push(message);
    }
  });

  const sendNowLength = sendNow.length;

  if (sendNowLength) {
    console.log(`– sending ${`sending ${ sendNowLength } message${ ((sendNowLength > 1) ? 's' : '') }` }`);
    socket.send(JSON.stringify(sendNow));
  }
};

ws.on('connection', handleSocket);
wss.on('connection', handleSocket);

server.listen(server_url_port, () => {
  console.log(`HTTP – Listening to port ${ server_url_port }`);
});
