import { request as httpsRequest } from 'https';
import { request as httpRequest } from 'http';
import { URL } from 'url';

async function proxyHandler(req, res) {
  console.log('Proxy request received:', req.method, req.query.url);
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Target URL is required as a query parameter');
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const libRequest = isHttps ? httpsRequest : httpRequest;

    // Define the options for the proxy request
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: { ...req.headers, host: parsedUrl.host },
    };
    console.log('Proxy request options:', options);
    // Create the proxy request
    const proxyReq = libRequest(options, proxyRes => {
      // Forward status and headers from the target response
      res.writeHead(proxyRes.statusCode, proxyRes.headers);

      // Pipe the response data from the target back to the client
      proxyRes.pipe(res);
    });

    // Handle any errors in the proxy request
    proxyReq.on('error', error => {
      res.status(500).send(`Error making proxy request: ${error.message}`);
    });
    if (Buffer.isBuffer(req.body)) {
      proxyReq.end(req.body); // If the body is already buffered, use it directly.
    } else {
      req.pipe(proxyReq); // Otherwise, pipe the request for streamed or chunked data.
    }
  } catch (error) {
    res.status(500).send(`Error processing request: ${error.message}`);
  }
}

export { proxyHandler };
