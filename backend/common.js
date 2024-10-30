import PinoHttp from 'pino-http';
import { filters } from './request-filters';
import { handleDockerDesktopSubsitution } from './docker-desktop-substitution';

const https = require('https');
const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid').v4;

const K8S_Keys = {
  URL: 'x-cluster-url',
  CA: 'x-cluster-certificate-authority-data',
  CLIENT_CA: 'x-client-certificate-data',
  CLIENT_KEY_DATA: 'x-client-key-data',
  AUTH: 'x-k8s-authorization',
};

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

export const makeHandleRequest = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const isTrackingEnabled =
    global.config?.features?.TRACKING?.isEnabled &&
    process.env.IS_DOCKER !== 'true';

  const logger = PinoHttp({
    autoLogging: !!(isDev || isTrackingEnabled), //to disable the automatic "request completed" and "request errored" logging.
    genReqId: req => {
      req.id = uuid();
      return req.id;
    },
    serializers: {
      req: req => ({
        id: req.id,
        method: req.method,
        url: req.url,
        apiServerAddress: req.headers['x-cluster-url'],
        code: req.code,
        stack: req.stack,
        type: req.type,
        msg: req.msg,
      }),
    },
  });

  return async (req, res) => {
    logger(req, res);
    let k8sData;
    try {
      k8sData = extractK8sData(req);
    } catch (e) {
      req.log.error('Headers error:' + e.message);
      res.status(400).send('Headers are missing or in a wrong format.');
      return;
    }

    try {
      filters.forEach(filter => filter(req, k8sData));
    } catch (e) {
      req.log.error('Filters rejected the request: ' + e.message);
      res.status(400).send('Request ID: ' + req.id);
      return;
    }

    const { targetApiServer, ca, cert, key, authorization } = k8sData;

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
        (k8sResponse.headers['content-type']?.includes('\\') ||
          k8sResponse.headers['content-encoding']?.includes('\\'))
      )
        return throwInternalServerError(
          'Response headers are potentially dangerous',
        );

      // change all 503 into 502
      console.log('MIME type', k8sResponse.headers['content-type']);
      const statusCode =
        k8sResponse.statusCode === 503 ? 502 : k8sResponse.statusCode;

      res.writeHead(statusCode, {
        'Content-Type': k8sResponse.headers['content-type'] || 'text/json',
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

function extractK8sData(req) {
  const urlHeader = 'x-cluster-url';

  let k8sData = null;
  let k8sUrl = req.headers[K8S_Keys.URL];
  // If url is not in headers we will try to extract it from cookies
  if (k8sUrl) {
    k8sData = req.headers;
  } else {
    let cookies = {};
    Object.keys(req.cookies).forEach(key => {
      cookies[key.toLowerCase()] = req.cookies[key];
    });
    k8sUrl = cookies[K8S_Keys.URL];
    k8sData = cookies;
  }

  const targetApiServer = handleDockerDesktopSubsitution(new URL(k8sUrl));
  const { ca, cert, key, authorization } = getK8SData(k8sData);

  delete req.headers.host; // remove host in order not to confuse APIServer
  deleteK8sHeaders(req.headers);

  return { targetApiServer, ca, cert, key, authorization };
}

function getK8SData(data) {
  const ca = decodeHeaderToBuffer(data[K8S_Keys.CA]) || certs;
  const cert = decodeHeaderToBuffer(data[K8S_Keys.CLIENT_CA]);
  const key = decodeHeaderToBuffer(data[K8S_Keys.CLIENT_KEY_DATA]);
  const authorization = data[K8S_Keys.AUTH];
  return { ca, cert, key, authorization };
}

function deleteK8sHeaders(headers) {
  delete headers[K8S_Keys.URL];
  delete headers[K8S_Keys.CA];
  delete headers[K8S_Keys.CLIENT_CA];
  delete headers[K8S_Keys.CLIENT_KEY_DATA];
  delete headers[K8S_Keys.AUTH];
}
