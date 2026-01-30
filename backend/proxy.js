/* global Buffer */
import rateLimit from 'express-rate-limit';
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import net from 'net';
import dns from 'dns/promises';
import { pipeline } from 'stream/promises';

function isLocalDomain(hostname) {
  const localDomains = ['localhost', '127.0.0.1', '::1'];
  const localSuffixes = ['.localhost', '.local', '.internal'];

  if (localDomains.includes(hostname.toLowerCase())) {
    return true;
  }

  return localSuffixes.some((suffix) => hostname.endsWith(suffix));
}

function isValidHost(hostname) {
  return !isLocalDomain(hostname) && net.isIP(hostname) === 0;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 172.16.0.0/12
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 127.0.0.0/8 (localhost)
    if (parts[0] === 127) return true;
  }
  if (net.isIPv6(ip)) {
    const lowerIp = ip.toLowerCase();
    // fc00::/7 (unique local addresses)
    if (lowerIp.startsWith('fc') || lowerIp.startsWith('fd')) return true;
    // fe80::/10 (link-local addresses)
    if (lowerIp.startsWith('fe80:')) return true;
    // ::1/128 (localhost)
    if (lowerIp === '::1') return true;
  }
  return false;
}

// Perform DNS resolution to check for private IPs
async function isPrivateAddress(hostname) {
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      if (isPrivateIp(addr.address)) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('DNS lookup failed:', err);
    return true;
  }
}

// Rate limiter: Max 100 requests per 1 minutes per IP
const proxyRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

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

    if (isValidHost(parsedUrl.hostname)) {
      return res.status(403).send('Request Forbidden');
    }

    if (await isPrivateAddress(parsedUrl.hostname)) {
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
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        try {
          await pipeline(proxyRes, res);
          resolve();
        } catch (err) {
          console.error('Proxy response pipeline error:', err);
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
          console.error('Request pipeline error:', err);
          proxyReq.destroy(err);
        });
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    if (!res.headersSent) {
      res.status(502).send('An error occurred while making the proxy request.');
    }
  }
}

export { proxyHandler, proxyRateLimiter };
