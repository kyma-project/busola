import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  isValidHost,
  resolveOrBlockPrivateIpAddress,
  PrivateIPUsedError,
} from '../utils/network-utils.js';

const router = express.Router();

const oidcDiscoveryRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

async function assertNotPrivateHost(hostname) {
  if (!isValidHost(hostname)) {
    throw new PrivateIPUsedError(`Hostname ${hostname} is not allowed`);
  }
  await new Promise((resolve, reject) => {
    resolveOrBlockPrivateIpAddress(hostname, {}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

router.get('/oidc-discovery', oidcDiscoveryRateLimiter, async (req, res) => {
  const { issuer } = req.query;

  if (!issuer || typeof issuer !== 'string') {
    return res.status(400).json({ error: 'Missing issuer parameter' });
  }

  let url;
  try {
    url = new URL(issuer);
  } catch {
    return res.status(400).json({ error: 'Invalid issuer URL' });
  }

  if (url.protocol !== 'https:') {
    return res.status(400).json({ error: 'Issuer URL must use HTTPS' });
  }

  try {
    await assertNotPrivateHost(url.hostname);
  } catch (err) {
    if (err instanceof PrivateIPUsedError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: 'Failed to resolve issuer hostname' });
  }

  try {
    const base = issuer.endsWith('/') ? issuer.slice(0, -1) : issuer;
    const response = await fetch(`${base}/.well-known/openid-configuration`);
    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: 'Discovery endpoint returned a non-ok response' });
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res
      .status(502)
      .json({ error: `Failed to fetch discovery document: ${error.message}` });
  }
});

export default router;
