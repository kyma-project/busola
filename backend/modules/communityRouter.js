import express from 'express';
import cors from 'cors';
import jsyaml from 'js-yaml';

const router = express.Router();
router.use(express.json());
router.use(cors());

const ALLOWED_DOMAINS = ['githubusercontent.com', 'github.com', 'github.io'];

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

    const response = await fetch(url.href);

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
    const data = await response.text();
    res.json(jsyaml.loadAll(data));
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch community resource. ${error}` });
  }
}

router.post('/community-resource', handleGetCommunityResource);

export default router;
