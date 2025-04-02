import { request as httpsRequest } from 'https';
import { URL } from 'url';
import net from 'net';

async function proxyHandler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Target URL is required as a query parameter');
  }

  try {
    const parsedUrl = new URL(targetUrl);

    if (parsedUrl.protocol !== 'https:') {
      return res.status(400).send('Only HTTPS protocol is allowed');
    }

    if (parsedUrl.hostname === 'localhost') {
      return res.status(400).send('Local URLs are not allowed');
    }

    if (net.isIP(parsedUrl.hostname) !== 0) {
      return res.status(400).send('IP addresses are not allowed');
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443, // Default to 443 for HTTPS
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: { ...req.headers, host: parsedUrl.host },
    };

    const proxyReq = httpsRequest(options, proxyRes => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.status(500).send('An error occurred while making the proxy request.');
    });

    if (Buffer.isBuffer(req.body)) {
      proxyReq.end(req.body); // Buffered body
    } else {
      req.pipe(proxyReq); // Streamed or chunked body
    }
  } catch (error) {
    res.status(400).send('Invalid target URL');
  }
}

export { proxyHandler };
