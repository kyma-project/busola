import express from 'express';
import rateLimit from 'express-rate-limit';
import escape from 'lodash.escape';
import { isPrivateAddressCached, isValidHost } from '../utils/network-utils.js';
import config from '../src/config/config.js';

// Proxies inline-edit requests to the external "kyma-ai-editor" backend so the
// browser never talks to it directly (no CORS, URL stays server-side). Mirrors
// the structure of ./companion/companionRouter.js.

const router = express.Router();
router.use(express.json());

const aiEditorRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function getApiBaseUrl() {
  return config.features?.AI_INLINE_EDIT?.config?.apiBaseUrl ?? '';
}

function allowPrivateIps() {
  return config.features?.ALLOW_PRIVATE_IPS?.isEnabled ?? false;
}

// SSRF hardening identical to ./proxy.js. The target is server-configured (not
// user-supplied), but we validate it anyway as defense in depth.
async function assertSafeUpstream(baseUrl) {
  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch (_) {
    throw httpError(500, 'AI inline edit backend URL is malformed');
  }
  if (parsed.protocol !== 'https:') {
    throw httpError(500, 'AI inline edit backend must use https');
  }
  if (allowPrivateIps()) {
    return parsed;
  }
  if (
    !isValidHost(parsed.hostname) ||
    (await isPrivateAddressCached(parsed.hostname))
  ) {
    throw httpError(500, 'AI inline edit backend host is not allowed');
  }
  return parsed;
}

function parseBody(req) {
  if (
    req.body &&
    typeof req.body === 'object' &&
    !ArrayBuffer.isView(req.body)
  ) {
    return req.body;
  }
  try {
    return JSON.parse(req.body.toString());
  } catch (_) {
    throw httpError(400, 'Invalid JSON in request body');
  }
}

export async function handleSuggestEdits(req, res) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      throw httpError(503, 'AI inline edit is not configured');
    }

    const { user_query, context, full_yaml, additional_context } =
      parseBody(req);

    if (typeof user_query !== 'string' || !user_query.trim()) {
      throw httpError(400, 'Missing or invalid "user_query"');
    }
    if (typeof full_yaml !== 'string' || full_yaml.length === 0) {
      throw httpError(400, 'Missing or invalid "full_yaml"');
    }

    await assertSafeUpstream(apiBaseUrl);
    const endpointUrl = new URL('/v1/suggest-edits', apiBaseUrl);

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        user_query,
        context,
        full_yaml,
        additional_context: additional_context ?? null,
      }),
    });

    if (!response.ok) {
      throw httpError(
        response.status,
        `AI inline edit backend responded with status ${response.status}`,
      );
    }

    const data = await response.json();
    if (typeof data?.updated_yaml !== 'string') {
      throw httpError(
        502,
        'AI inline edit backend returned an unexpected response',
      );
    }

    res.json({ updated_yaml: data.updated_yaml });
  } catch (error) {
    req.log?.warn(error);
    res.status(error.status ?? 500).json({
      error: error.message || 'Failed to fetch AI suggestions',
      requestId: escape(req.id ?? ''),
    });
  }
}

router.post('/suggest-edits', aiEditorRateLimiter, handleSuggestEdits);

export default router;
