import { request as httpsRequest } from 'https';
import { URL } from 'url';
import net from 'net';

function isLocalDomain(hostname) {
  const localDomains = ['localhost', '127.0.0.1', '::1'];
  const localSuffixes = ['.localhost', '.local', '.internal'];

  if (localDomains.includes(hostname.toLowerCase())) {
    return true;
  }

  return localSuffixes.some(suffix => hostname.endsWith(suffix));
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

    if (isLocalDomain(parsedUrl.hostname)) {
      return res.status(403).send('Request Forbidden');
    }

    if (net.isIP(parsedUrl.hostname) !== 0) {
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

    const proxyReq = httpsRequest(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.status(502).send('An error occurred while making the proxy request.');
    });

    if (Buffer.isBuffer(req.body)) {
      proxyReq.end(req.body);
    } else {
      req.pipe(proxyReq);
    }
  } catch (error) {
    res.status(400).send('Bad Request');
  }
}

export { proxyHandler };
