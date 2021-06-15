const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
import { handleRequest } from './common';
import { requestLogger } from './utils/other';

const app = express();
app.use(express.raw({ type: '*/*', limit: '100mb' }));
if (process.env.NODE_ENV === 'development') {
  app.use(cors({ origin: '*' }));
}

const server = http.createServer(app);
// requestLogger(require("http")); //uncomment this to log the outgoing traffic
// requestLogger(require("https")); //uncomment this to log the outgoing traffic

const port = process.env.PORT || 3001;
const address = process.env.ADDRESS || 'localhost';

const isLocalDev = address === 'localhost';

if (isLocalDev) {
  app.use('/backend', handleRequest);
} else {
  app.use('/core-ui', express.static(path.join(__dirname, 'core-ui')));
  app.get('/core-ui/*', (_, res) =>
    res.sendFile(path.join(__dirname + '/core-ui/index.html')),
  );

  app.use('/backend', handleRequest);

  app.use('/', express.static(path.join(__dirname, 'core')));
  app.get('/*', (_, res) =>
    res.sendFile(path.join(__dirname + '/core/index.html')),
  );
}

server.listen(port, address, () => {
  console.log(
    `${isLocalDev ? 'Local ' : ''}Busola backend server started @ ${port}!`,
  );
});
