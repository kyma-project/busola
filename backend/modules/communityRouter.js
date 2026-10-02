import express from 'express';
import cors from 'cors';
import jsyaml from 'js-yaml';
import config from '../src/config/config.js';

const router = express.Router();
router.use(express.json());
router.use(cors());

const ALLOWED_DOMAINS = ['githubusercontent.com', 'github.com', 'github.io'];
const MAX_RESPONSE_BYTES =
  config.features?.COMMUNITY_PROXY?.maxResponseBytes ?? 1 * 1024 * 1024;
const FETCH_TIMEOUT_MS =
  config.features?.COMMUNITY_PROXY?.fetchTimeoutMs ?? 10_000;

async function readBodyWithSizeLimit(response) {
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_RESPONSE_BYTES) {
    throw new Error('Response too large');
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalSize = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.length;
      if (totalSize > MAX_RESPONSE_BYTES) {
        throw new Error('Response too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const merged = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

function isAllowedUrl(url) {
  const isAllowedHost = ALLOWED_DOMAINS.some(
    (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
  );
  const isDefaultHttpPort = !url.port || url.port === '443';
  return url.protocol === 'https:' && isAllowedHost && isDefaultHttpPort;
}

async function handleGetCommunityResource(req, res) {
  const { link } = JSON.parse(req.body.toString());

  // Validate that link is a string and a valid HTTPS URL, and restrict to allowed domains.
  if (typeof link !== 'string') {
    return res.status(400).json({ message: 'Link must be a string.' });
  }

  try {
    const url = new URL(link);
    if (!isAllowedUrl(url)) {
      return res.status(400).json({
        message: 'Invalid or untrusted link provided.',
      });
    }

    const response = await fetch(url.href, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    // We cannot disable redirects because github redirects to release assets.
    // The final URL is checked if there was an open redirect vuln on github.com.
    const finalUrl = new URL(response.url);
    if (!isAllowedUrl(finalUrl)) {
      return res.status(400).json({
        message: 'Invalid or untrusted link provided.',
      });
    }

    if (response.status === 404) {
      return res.status(404).json({
        message: `The resource doesn't exist`,
      });
    }
    const data = await readBodyWithSizeLimit(response);
    res.json(jsyaml.loadAll(data));
  } catch (error) {
    if (error.message === 'Response too large') {
      return res
        .status(413)
        .json({ message: 'Community resource is too large.' });
    }
    res
      .status(500)
      .json({ message: `Failed to fetch community resource. ${error}` });
  }
}

router.post('/community-resource', handleGetCommunityResource);

export default router;
