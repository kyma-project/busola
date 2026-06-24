import express from 'express';
import rateLimit from 'express-rate-limit';
import escape from 'lodash.escape';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { isPrivateAddressCached, isValidHost } from '../utils/network-utils.js';
import {
  getK8sCredentialFromBody,
  hashCredential,
  requireCredential,
} from '../utils/rate-limit-key.js';
import config from '../src/config/config.js';

const router = express.Router();
router.use(express.json());

// Separate buckets: /insights keys by cluster credential (not req.ip) to avoid
// all users sharing one bucket behind the Cloud LB.
const suggestEditsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const requireInsightsCredential = requireCredential(getK8sCredentialFromBody);

const insightsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    hashCredential(getK8sCredentialFromBody(req), 'ai-editor'),
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

// Server-configured target, but validate anyway as defense in depth.
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

router.post('/suggest-edits', suggestEditsRateLimiter, handleSuggestEdits);

function buildInsightsHeaders(authData) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (authData.clusterUrl) headers['X-Cluster-Url'] = authData.clusterUrl;
  if (authData.certificateAuthorityData) {
    headers['X-Cluster-Certificate-Authority-Data'] =
      authData.certificateAuthorityData;
  }
  if (authData.clusterToken) {
    headers['X-K8s-Authorization'] = authData.clusterToken;
  } else if (authData.clientCertificateData && authData.clientKeyData) {
    headers['X-Client-Certificate-Data'] = authData.clientCertificateData;
    headers['X-Client-Key-Data'] = authData.clientKeyData;
  }
  return headers;
}

export async function handleInsights(req, res) {
  try {
    const apiBaseUrl = getApiBaseUrl();
    if (!apiBaseUrl) {
      throw httpError(503, 'AI insights backend is not configured');
    }

    const body = parseBody(req);
    const {
      resource_kind,
      resource_name = '',
      resource_api_version = '',
      namespace = '',
      additional_context = null,
      clusterUrl,
      certificateAuthorityData,
      clusterToken,
      clientCertificateData,
      clientKeyData,
    } = body;

    if (typeof resource_kind !== 'string' || !resource_kind.trim()) {
      throw httpError(400, 'Missing or invalid "resource_kind"');
    }

    await assertSafeUpstream(apiBaseUrl);
    const endpointUrl = new URL('/api/v2/insights', apiBaseUrl);

    const headers = buildInsightsHeaders({
      clusterUrl,
      certificateAuthorityData,
      clusterToken,
      clientCertificateData,
      clientKeyData,
    });
    headers['Accept'] = 'text/event-stream';

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resource_kind,
        resource_name,
        resource_api_version,
        namespace,
        additional_context,
      }),
    });

    if (!response.ok) {
      throw httpError(
        response.status,
        `AI insights backend responded with status ${response.status}`,
      );
    }

    if (!response.body) {
      throw httpError(502, 'AI insights backend returned an empty response');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await pipeline(Readable.fromWeb(response.body), res);
  } catch (error) {
    req.log?.warn(error);
    if (!res.headersSent) {
      res.status(error.status ?? 500).json({
        error: error.message || 'Failed to fetch AI insights',
        requestId: escape(req.id ?? ''),
      });
    }
  }
}

router.post(
  '/insights',
  requireInsightsCredential,
  insightsRateLimiter,
  handleInsights,
);

export default router;
