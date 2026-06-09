/* global Buffer */
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import { pipeline } from 'stream/promises';
import { isPrivateAddressCached, isValidHost } from './utils/network-utils.js';

const ALLOWED_RESPONSE_HEADERS = [
  'content-type',
  'content-length',
  'content-encoding',
  'cache-control',
  'etag',
  'last-modified',
];

export function buildSafeProxyHeaders(upstreamHeaders) {
  const safe = {};
  for (const h of ALLOWED_RESPONSE_HEADERS) {
    if (upstreamHeaders[h]) safe[h] = upstreamHeaders[h];
  }
  safe['x-content-type-options'] = 'nosniff';
  return safe;
}

async function proxyHandler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Bad Request');
  }

  try {
    const parsedUrl = new URL(targetUrl);

    if (parsedUrl.protocol !== 'https:') {
      return res.status(403).send('Request Forbidden');
    }

    if (!isValidHost(parsedUrl.hostname)) {
      return res.status(403).send('Request Forbidden');
    }

    if (await isPrivateAddressCached(parsedUrl.hostname)) {
      return res.status(403).send('Request Forbidden');
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: { ...req.headers, host: parsedUrl.host },
      timeout: 30000,
    };

    await new Promise((resolve, reject) => {
      const proxyReq = httpsRequest(options, async (proxyRes) => {
        res.writeHead(
          proxyRes.statusCode,
          buildSafeProxyHeaders(proxyRes.headers),
        );
        try {
          await pipeline(proxyRes, res);
          resolve();
        } catch (err) {
          req.log.error({ err }, 'Proxy response pipeline error');
          reject(err);
        }
      });

      proxyReq.on('error', (err) => {
        reject(err);
      });

      if (Buffer.isBuffer(req.body)) {
        proxyReq.end(req.body);
      } else {
        pipeline(req, proxyReq).catch((err) => {
          req.log.error({ err }, 'Request pipeline error');
          proxyReq.destroy(err);
        });
      }
    });
  } catch (err) {
    req.log.error({ err }, 'Proxy error');
    if (!res.headersSent) {
      res.status(502).send('An error occurred while making the proxy request.');
    }
  }
}

export { proxyHandler };
