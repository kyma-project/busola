import express from 'express';
import cors from 'cors';

const router = express.Router();
router.use(express.json());
router.use(cors());

async function handleGetCommunityResource(req, res) {
  const { link } = JSON.parse(req.body.toString());

  // Only allow URLs that start with https.
  const allowedDomain = /^https:\/\//;
  if (!allowedDomain.test(link)) {
    return res.status(400).json('Invalid or untrusted link provided.');
  }

  try {
    const response = await fetch(link);
    const data = await response.text();
    res.json(data);
  } catch (error) {
    res.status(500).json(`Failed to fetch community resource. ${error}`);
  }
}

router.post('/resource', handleGetCommunityResource);

export default router;
