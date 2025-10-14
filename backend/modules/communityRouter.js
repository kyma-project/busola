import express from 'express';
import cors from 'cors';
import jsyaml from 'js-yaml';
import https from 'https';

const router = express.Router();
router.use(express.json());
router.use(cors());

const httpsAgent = new https.Agent({
  minVersion: 'TLSv1.3',
  maxVersion: 'TLSv1.3',
});

async function handleGetCommunityResource(req, res) {
  const { link } = JSON.parse(req.body.toString());

  // Validate that link is a string and a valid HTTPS URL, and restrict to allowed domains.
  if (typeof link !== 'string') {
    return res.status(400).json({ message: 'Link must be a string.' });
  }

  try {
    const url = new URL(link);
    // Only allow HTTPS protocol and restrict to specific trusted domains.
    const allowedDomains = ['github.com', 'github.io'];
    if (
      url.protocol !== 'https:' ||
      !allowedDomains.some((domain) => url.hostname.endsWith(domain))
    ) {
      return res.status(400).json({
        message: 'Invalid or untrusted link provided.',
      });
    } else {
      const response = await fetch(link, {
        agent: httpsAgent,
      });
      if (response.status === 404) {
        return res.status(404).json({
          message: `The resource doesn't exist`,
        });
      }
      const data = await response.text();
      res.json(jsyaml.loadAll(data));
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Failed to fetch community resource. ${error}` });
  }
}

router.post('/community-resource', handleGetCommunityResource);

export default router;
