const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid').v4;
import { handleDockerDesktopSubsitution } from './docker-desktop-substitution';
import { filters } from './request-filters';

export const logger = require('pino-http')({
  autoLogging: process.env.NODE_ENV === 'production', //to disable the automatic "request completed" and "request errored" logging.
  genReqId: req => {
    req.id = uuid();
    return req.id;
  },
  serializers: {
    req: req => ({
      id: req.id,
      method: req.method,
      url: req.url,
      cluster_url: req.headers['x-cluster-url'],
      code: req.code,
      stack: req.stack,
      type: req.type,
      msg: req.msg,
    }),
  },
});

// https://github.tools.sap/sgs/SAP-Global-Trust-List/blob/master/approved.pem
const certs = fs.readFileSync('certs.pem', 'utf8');

const isHeaderDefined = headerValue => {
  return headerValue !== undefined && headerValue !== 'undefined';
};

const decodeHeaderToBuffer = headerValue => {
  return isHeaderDefined(headerValue)
    ? Buffer.from(headerValue, 'base64')
    : null;
};

// for some mysterious reason, request for node metrics
// comes with "Connection: Upgrade" header, causing
// "invalid upgrade response: status code 200" error
const workaroundForNodeMetrics = req => {
  if (req.originalUrl.includes('apis/metrics.k8s.io/v1beta1/nodes')) {
    req.headers['connection'] = 'close';
  }
};

export const handleRequest = async (req, res) => {
  logger(req, res);
  let headersData;
  try {
    headersData = extractHeadersData(req);
  } catch (e) {
    req.log.error('Headers error:' + e.message);
    res.status(400).send('Headers are missing or in a wrong format.');
    return;
  }

  try {
    filters.forEach(filter => filter(req, headersData));
  } catch (e) {
    req.log.error('Filters rejected the request: ' + e.message);
    res.status(400).send('Request ID: ' + req.id);
    return;
  }

  const { targetApiServer, ca, cert, key, authorization } = headersData;

  const headers = authorization
    ? { ...req.headers, authorization }
    : req.headers;

  const options = {
    hostname: targetApiServer.hostname,
    path: req.originalUrl.replace(/^\/backend/, ''),
    headers,
    body: req.body,
    method: req.method,
    port: targetApiServer.port || 443,
    ca,
    cert,
    key,
  };
  workaroundForNodeMetrics(req);

  const k8sRequest = https.request(options, function(k8sResponse) {
    if (
      k8sResponse.headers &&
      (k8sResponse.headers['Content-Type']?.includes('\\') ||
        k8sResponse.headers['content-encoding']?.includes('\\'))
    )
      return throwInternalServerError(
        'Response headers are potentially dangerous',
      );

    res.writeHead(k8sResponse.statusCode, {
      'Content-Type': k8sResponse.headers['Content-Type'] || 'text/json',
      'Content-Encoding': k8sResponse.headers['content-encoding'] || '',
    });
    k8sResponse.pipe(res);
  });
  k8sRequest.on('error', throwInternalServerError); // no need to sanitize the error here as the http.request() will never throw a vulnerable error
  k8sRequest.end(Buffer.isBuffer(req.body) ? req.body : undefined);
  req.pipe(k8sRequest);

  function throwInternalServerError(originalError) {
    req.log.warn(originalError);
    res.status(502).send('Request ID: ' + req.id);
  }
};

export const serveStaticApp = (app, requestPath, directoryPath) => {
  app.use(requestPath, express.static(path.join(__dirname, directoryPath)));
  app.get(requestPath + '*', (_, res) =>
    res.sendFile(path.join(__dirname + directoryPath + '/index.html')),
  );
};

export const serveMonaco = app => {
  app.use('/vs', express.static(path.join(__dirname, '/core-ui/vs')));
};

function extractHeadersData(req) {
  const urlHeader = 'x-cluster-url';
  const caHeader = 'x-cluster-certificate-authority-data';
  const clientCAHeader = 'x-client-certificate-data';
  const clientKeyDataHeader = 'x-client-key-data';
  const authorizationHeader = 'x-k8s-authorization';

  const targetApiServer = handleDockerDesktopSubsitution(
    new URL(req.headers[urlHeader]),
  );
  const ca = decodeHeaderToBuffer(req.headers[caHeader]) || certs;
  const cert = decodeHeaderToBuffer(req.headers[clientCAHeader]);
  const key = decodeHeaderToBuffer(req.headers[clientKeyDataHeader]);
  const authorization = req.headers[authorizationHeader];

  delete req.headers[urlHeader];
  delete req.headers[caHeader];
  delete req.headers[clientCAHeader];
  delete req.headers[clientKeyDataHeader];
  delete req.headers[authorizationHeader];

  delete req.headers.host; // remove host in order not to confuse APIServer

  return { targetApiServer, ca, cert, key, authorization };
}
