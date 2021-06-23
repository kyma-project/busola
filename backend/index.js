const express = require('express');
const cors = require('cors');
const http = require('http');
import { handleRequest, serveStaticApp, serveMonaco } from './common';
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
  app.use(handleRequest);
} else {
  // yup, order matters here
  serveStaticApp(app, '/core-ui/', '/core-ui');
  serveStaticApp(app, '/service-catalog', '/service-catalog-ui');
  serveMonaco(app);
  app.use('/backend', handleRequest);
  serveStaticApp(app, '/', '/core');
}

server.listen(port, address, () => {
  console.log(`Busola backend server started @ ${port}!`);
});
