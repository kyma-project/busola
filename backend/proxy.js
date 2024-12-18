import { request as httpsRequest } from 'https';
import { request as httpRequest } from 'http';
import { URL } from 'url';

async function proxyHandler(req, res) {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Target URL is required as a query parameter');
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const libRequest = isHttps ? httpsRequest : httpRequest;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: { ...req.headers, host: parsedUrl.host },
    };

    const proxyReq = libRequest(options, proxyRes => {
      // Forward status and headers from the target response
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      // Pipe the response data from the target back to the client
      proxyRes.pipe(res);
    });

    proxyReq.on('error', () => {
      res.status(500).send('An error occurred while making the proxy request.');
    });

    if (Buffer.isBuffer(req.body)) {
      proxyReq.end(req.body); // If the body is already buffered, use it directly.
    } else {
      req.pipe(proxyReq); // Otherwise, pipe the request for streamed or chunked data.
    }
  } catch (error) {
    res.status(500).send('An error occurred while processing the request.');
  }
}

export { proxyHandler };
