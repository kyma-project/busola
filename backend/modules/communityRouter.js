import express from 'express';
import cors from 'cors';
import jsyaml from 'js-yaml';
import config from '../src/config/config.js';
import request from '../utils/request.js';
import { validateGithub } from '../utils/validators.js';
import {
  PrivateIPUsedError,
  ResponseTooLargeError,
  RequestTimeoutError,
} from '../utils/http-errors.js';

const router = express.Router();
router.use(express.json());
router.use(cors());

const MAX_RESPONSE_BYTES =
  config.features?.COMMUNITY_PROXY?.maxResponseBytes ?? 1 * 1024 * 1024;
const FETCH_TIMEOUT_MS =
  config.features?.COMMUNITY_PROXY?.fetchTimeoutMs ?? 10_000;

async function handleGetCommunityResource(req, res) {
  const { link } = JSON.parse(req.body.toString());

  if (typeof link !== 'string') {
    return res.status(400).json({ message: 'Link must be a string.' });
  }

  let url;
  try {
    url = new URL(link);
  } catch {
    return res
      .status(400)
      .json({ message: 'Invalid or untrusted link provided.' });
  }

  try {
    const response = await request(url.href, {
      validators: [validateGithub],
      maxResponseBytes: MAX_RESPONSE_BYTES,
      timeoutMs: FETCH_TIMEOUT_MS,
    });

    if (response.status === 404) {
      return res.status(404).json({
        message: `The resource doesn't exist`,
      });
    }

    res.json(jsyaml.loadAll(response.body));
  } catch (error) {
    if (error instanceof PrivateIPUsedError) {
      return res
        .status(400)
        .json({ message: 'Invalid or untrusted link provided.' });
    }
    if (error instanceof ResponseTooLargeError) {
      return res
        .status(413)
        .json({ message: 'Community resource is too large.' });
    }
    if (error instanceof RequestTimeoutError) {
      return res
        .status(504)
        .json({ message: 'Timed out fetching community resource.' });
    }
    if (error instanceof jsyaml.YAMLException) {
      return res
        .status(422)
        .json({ message: 'Community resource is not valid YAML.' });
    }
    res
      .status(500)
      .json({ message: `Failed to fetch community resource. ${error}` });
  }
}

router.post('/community-resource', handleGetCommunityResource);

export default router;
