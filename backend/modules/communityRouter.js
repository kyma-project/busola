import express from 'express';
import cors from 'cors';
import jsyaml from 'js-yaml';

const router = express.Router();
router.use(express.json());
router.use(cors());

async function handleGetCommunityResource(req, res) {
  const { link } = JSON.parse(req.body.toString());

  // Validate that link is a string and a valid HTTPS URL, and restrict to allowed domains.
  if (typeof link !== 'string') {
    return res.status(400).json('Link must be a string.');
  }

  try {
    const url = new URL(link);
    // Only allow HTTPS protocol and restrict to specific trusted domains.
    const allowedDomains = ['github.com'];
    if (
      url.protocol !== 'https:' ||
      !allowedDomains.some((domain) => url.hostname.endsWith(domain))
    ) {
      return res.status(400).json('Invalid or untrusted link provided.');
    } else {
      const response = await fetch(link);
      const data = await response.text();
      res.json(jsyaml.loadAll(data));
    }
  } catch (error) {
    res.status(500).json(`Failed to fetch community resource. ${error}`);
  }
}

router.post('/community-resource', handleGetCommunityResource);

export default router;
