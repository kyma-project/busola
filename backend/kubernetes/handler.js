/* global Buffer, require */
import { handleDockerDesktopSubsitution } from '../docker-desktop-substitution';
import { filters } from '../request-filters';
import { pipeline } from 'stream/promises';
import { tokenAuthAgent } from '../utils/https-agent.js';

const https = require('https');
const fs = require('fs');
const escape = require('lodash.escape');

// https://github.tools.sap/sgs/SAP-Global-Trust-List/blob/master/approved.pem
const certs = fs.readFileSync('certs.pem', 'utf8');

const isHeaderDefined = (headerValue) => {
  return headerValue !== undefined && headerValue !== 'undefined';
};

const decodeHeaderToBuffer = (headerValue) => {
  return isHeaderDefined(headerValue)
    ? Buffer.from(headerValue, 'base64')
    : null;
};

// for some mysterious reason, request for node metrics
// comes with "Connection: Upgrade" header, causing
// "invalid upgrade response: status code 200" error
const workaroundForNodeMetrics = (req) => {
  if (req.originalUrl.includes('apis/metrics.k8s.io/v1beta1/nodes')) {
    req.headers['connection'] = 'close';
  }
};

export async function handleK8sRequests(req, res) {
  let headersData;
  try {
    headersData = extractHeadersData(req);
  } catch (e) {
    req.log.error('Headers error:' + e.message);
    res.contentType('text/plain; charset=utf-8');
    res.status(400).send('Headers are missing or in a wrong format.');
    return;
  }

  try {
    filters.forEach((filter) => filter(req, headersData));
  } catch (e) {
    req.log.error('Filters rejected the request: ' + e.message);
    res.contentType('text/plain; charset=utf-8');
    res.status(400).send('Request ID: ' + escape(req.id));
    return;
  }

  const { targetApiServer, ca, cert, key, authorization } = headersData;

  const headers = authorization
    ? { ...req.headers, authorization }
    : req.headers;

  // Use keep-alive agent for token auth only (skip for cert auth)
  const useAgent = authorization && !cert && !key;
  const agent = useAgent ? tokenAuthAgent : undefined;

  const options = {
    hostname: targetApiServer.hostname,
    path: req.originalUrl.replace(/^\/backend/, ''),
    headers,
    method: req.method,
    port: targetApiServer.port || 443,
    ca,
    cert,
    key,
    agent,
  };
  workaroundForNodeMetrics(req);

  function throwInternalServerError(originalError) {
    req.log.warn(
      { err: originalError },
      'Internal server error during K8s proxy',
    );
    if (!res.headersSent) {
      res.contentType('text/plain; charset=utf-8');
      res
        .status(502)
        .send('Internal server error. Request ID: ' + escape(req.id));
    }
  }

  try {
    await new Promise((resolve, reject) => {
      const k8sRequest = https.request(options, async function (k8sResponse) {
        if (
          k8sResponse.headers &&
          (k8sResponse.headers['Content-Type']?.includes('\\') ||
            k8sResponse.headers['content-encoding']?.includes('\\'))
        ) {
          reject(new Error('Response headers are potentially dangerous'));
          return;
        }

        // change all 503 into 502
        const statusCode =
          k8sResponse.statusCode === 503 ? 502 : k8sResponse.statusCode;

        // Ensure charset is specified in content type
        let contentType = k8sResponse.headers['Content-Type'] || 'text/json';
        if (!contentType.includes('charset=')) {
          contentType += '; charset=utf-8';
        }

        res.writeHead(statusCode, {
          'Content-Type': contentType,
          'Content-Encoding': k8sResponse.headers['content-encoding'] || '',
          'X-Content-Type-Options': 'nosniff',
        });

        try {
          await pipeline(k8sResponse, res);
          resolve();
        } catch (err) {
          req.log.warn('K8s response pipeline error:', err);
          reject(err);
        }
      });

      k8sRequest.on('error', (err) => {
        reject(err);
      });

      if (Buffer.isBuffer(req.body)) {
        k8sRequest.end(req.body);
      } else {
        // If there's no body, pipe the request (for streaming)
        pipeline(req, k8sRequest).catch((err) => {
          req.log.warn('Request pipeline error:', err);
          k8sRequest.destroy(err);
        });
      }
    });
  } catch (error) {
    throwInternalServerError(error);
  }
}

function extractHeadersData(req) {
  const urlHeader = 'x-cluster-url';
  const caHeader = 'x-cluster-certificate-authority-data';
  const clientCAHeader = 'x-client-certificate-data';
  const clientKeyDataHeader = 'x-client-key-data';
  const authorizationHeader = 'x-k8s-authorization';
  let targetApiServer;

  if (req.headers[urlHeader]) {
    try {
      targetApiServer = handleDockerDesktopSubsitution(
        new URL(req.headers[urlHeader]),
      );
    } catch (e) {
      throw new Error(`Invalid cluster URL provided: ${e.message}`);
    }
  } else {
    throw new Error('Missing required cluster URL.');
  }

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
