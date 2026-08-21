import express from 'express';

const router = express.Router();

router.get('/oidc-discovery', async (req, res) => {
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
    const base = issuer.replace(/\/$/, '');
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
