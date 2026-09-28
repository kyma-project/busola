import express from 'express';
import cors from 'cors';
import jsyaml from 'js-yaml';

const router = express.Router();
router.use(express.json());
router.use(cors());

const ALLOWED_DOMAINS = ['githubusercontent.com', 'github.com', 'github.io'];
const MAX_RESPONSE_BYTES = 1 * 1024 * 1024; // 1 MB
const FETCH_TIMEOUT_MS = 10_000; // 10 s

async function readBodyWithSizeLimit(response) {
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
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

    // Validate the final URL after redirect-following against the same allowlist.
    // This prevents a trusted GitHub URL from redirecting to an arbitrary destination
    // (SSRF via open redirect on a trusted host).
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
