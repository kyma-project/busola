import express from 'express';
import rateLimit from 'express-rate-limit';
import { TokenManager } from './TokenManager';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import escape from 'lodash.escape';
import {
  getK8sCredentialFromBody,
  hashCredential,
  requireCredential,
} from '../utils/rate-limit-key.js';
import { createBoundedCache } from '../utils/bounded-cache.js';
import { extractShootId } from './extractShootId.js';

import config from '../src/config/config.js';

const tokenManager = new TokenManager();

const companionApiBaseUrl =
  config.features?.KYMA_COMPANION?.config?.apiBaseUrl ?? '';

// Read from our own env config, not the cluster — otherwise a cluster could
// just claim it's on the allowed issuer.
const allowedIssuerUrl =
  config.features?.KYMA_COMPANION?.config?.issuerUrl ?? '';

const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

const COMPANION_API_BASE_URL = `${companionApiBaseUrl}/api/conversations/`;

const COMPANION_PUBLIC_KEY_URL = companionApiBaseUrl
  ? new URL('/api/public-key', companionApiBaseUrl).toString()
  : '';

const SKIP_AUTH = config.features?.KYMA_COMPANION?.config?.skipAuth ?? false;
const router = express.Router();

const requireCompanionCredential = requireCredential(getK8sCredentialFromBody);

const companionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => hashCredential(getK8sCredentialFromBody(req), 'cred'),
});

// A cluster's region never changes, so we can keep it cached for the whole run.
const CLUSTER_REGION_CACHE_MAX = 1000;
const clusterRegionCache = createBoundedCache({
  max: CLUSTER_REGION_CACHE_MAX,
});
const clusterRegionNegativeCache = createBoundedCache({
  max: CLUSTER_REGION_CACHE_MAX,
  ttlMs: 60 * 1000,
});

router.use(express.json());

async function handlePublicKey(req, res) {
  try {
    if (!COMPANION_PUBLIC_KEY_URL) {
      throw new Error('Missing companion public key URL configuration');
    }

    const parsed =
      typeof req.body === 'object' && !ArrayBuffer.isView(req.body)
        ? req.body
        : JSON.parse(req.body.toString());

    const publicKey = parsed.public_key;
    if (!publicKey || typeof publicKey !== 'string') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid public_key in request body' });
    }

    // Joule can only get the cluster's credentials through this key exchange,
    // so blocking it here shuts Joule out even if someone skips the UI checks.
    const { eligible, reason } = await checkJouleEligibility({
      clusterUrl: parsed.clusterUrl,
      oidcIssuerUrl: parsed.oidcIssuerUrl,
    });
    if (!eligible) {
      return res
        .status(403)
        .json({ error: 'Joule is not available for this cluster', reason });
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (!SKIP_AUTH) {
      const AUTH_TOKEN = await tokenManager.getToken();
      headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }

    const response = await fetch(COMPANION_PUBLIC_KEY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ public_key: publicKey }),
    });

    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    req.log.warn(error);
    res.status(500).json({
      error: 'Failed to exchange encryption key. Request ID: ' + escape(req.id),
    });
  }
}

function extractAuthHeaders(req) {
  let parsedBody;

  if (typeof req.body === 'object' && !ArrayBuffer.isView(req.body)) {
    parsedBody = req.body;
  } else {
    try {
      parsedBody = JSON.parse(req.body.toString());
    } catch (_) {
      const error = new Error('Invalid JSON in request body');
      error.status = 400;
      throw error;
    }
  }

  const {
    clusterUrl,
    certificateAuthorityData,
    clusterToken,
    clientCertificateData,
    clientKeyData,
    sessionId,
    oidcIssuerUrl,
  } = parsedBody;
  return {
    clusterUrl,
    certificateAuthorityData,
    clusterToken,
    clientCertificateData,
    clientKeyData,
    sessionId,
    oidcIssuerUrl,
  };
}

async function buildApiHeaders(authData, contentType = 'application/json') {
  const headers = {
    Accept: contentType,
    'Content-Type': 'application/json',
    'X-Cluster-Certificate-Authority-Data': authData.certificateAuthorityData,
    'X-Cluster-Url': authData.clusterUrl,
  };

  if (!SKIP_AUTH) {
    const AUTH_TOKEN = await tokenManager.getToken();
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  if (authData.sessionId) {
    headers['Session-Id'] = authData.sessionId;
  }

  if (authData.clusterToken) {
    headers['X-K8s-Authorization'] = authData.clusterToken;
  } else if (authData.clientCertificateData && authData.clientKeyData) {
    headers['X-Client-Certificate-Data'] = authData.clientCertificateData;
    headers['X-Client-Key-Data'] = authData.clientKeyData;
  } else {
    throw new Error('Missing authentication credentials');
  }

  return headers;
}

async function handlePromptSuggestions(req, res) {
  const authData = extractAuthHeaders(req);

  try {
    const { namespace, resourceType, groupVersion, resourceName } = JSON.parse(
      req.body.toString(),
    );
    const endpointUrl = COMPANION_API_BASE_URL;
    const payload = {
      resource_kind: resourceType,
      resource_api_version: groupVersion,
      resource_name: resourceName,
      namespace: namespace,
    };
    const headers = await buildApiHeaders(authData);

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    res.json({
      promptSuggestions: data?.initial_questions,
      conversationId: data?.conversation_id,
    });
  } catch (error) {
    req.log.warn(error);
    res.status(500).json({
      error: 'Failed to fetch AI chat data. Request ID: ' + escape(req.id),
    });
  }
}

async function handleChatMessage(req, res) {
  const authData = extractAuthHeaders(req);
  const conversationId = authData.sessionId;

  try {
    const { query, namespace, resourceType, groupVersion, resourceName } =
      JSON.parse(req.body.toString());

    const endpointUrl = new URL(
      `${encodeURIComponent(conversationId)}/messages`,
      COMPANION_API_BASE_URL,
    );

    const payload = {
      query,
      resource_kind: resourceType,
      resource_api_version: groupVersion,
      resource_name: resourceName,
      namespace: namespace,
    };

    const uuidPattern = /^[a-f0-9]{32}$/i;
    if (!uuidPattern.test(conversationId)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      error.error = 'Invalid session ID';
      throw error;
    }
    // Set up headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const headers = await buildApiHeaders(authData, 'text/event-stream');

    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = new Error();
      error.status = response.status;

      if (response.status >= 500) {
        error.message = 'A temporary interruption occurred. Please try again.';
        error.error = 'Service is interrupted';
      } else {
        const respJson = await response?.json();
        error.message =
          respJson?.message ??
          'A temporary interruption occurred. Please try again.';
        error.error = respJson?.error ?? response?.statusText;
      }

      throw error;
    }

    const stream = Readable.fromWeb(response.body);
    await pipeline(stream, res);
  } catch (error) {
    req.log.warn(error);
    if (!res.headersSent) {
      res.status(error.status ?? 500).json({
        error: error.error,
        message: error.message,
      });
    } else {
      res.write(
        JSON.stringify({
          streamingError: {
            message:
              'An error occured during streaming. Request ID: ' +
              escape(req.id),
          },
        }) + '\n',
      );
      res.end();
    }
  }
}

async function handleFollowUpSuggestions(req, res) {
  const authData = extractAuthHeaders(req);
  const conversationId = authData.sessionId;

  try {
    const uuidPattern = /^[a-f0-9]{32}$/i;
    if (!uuidPattern.test(conversationId)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      error.error = 'Invalid session ID';
      throw error;
    }

    const endpointUrl = new URL(
      `${encodeURIComponent(conversationId)}/questions`,
      COMPANION_API_BASE_URL,
    );

    const headers = await buildApiHeaders(authData);

    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    res.json({
      promptSuggestions: data?.questions,
      conversationId: data?.conversation_id,
    });
  } catch (error) {
    req.log.warn(error);
    res
      .status(error.status ?? 500)
      .json({ error: `Failed to fetch AI chat data: ${error.message}` });
  }
}

async function fetchClusterRegion(shootId) {
  const cached = clusterRegionCache.get(shootId);
  if (cached !== undefined) return cached;
  if (clusterRegionNegativeCache.has(shootId)) return null;

  const url = new URL(
    `/api/tools/cluster-region/${encodeURIComponent(shootId)}`,
    companionApiBaseUrl,
  );
  const headers = { Accept: 'application/json' };
  if (!SKIP_AUTH) {
    const AUTH_TOKEN = await tokenManager.getToken();
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  const response = await fetch(url.toString(), { method: 'GET', headers });

  const isOk = response.status >= 200 && response.status < 300;
  if (!isOk) {
    // Only remember 4xx answers — a 5xx is probably temporary, so let it retry.
    if (response.status >= 400 && response.status < 500) {
      clusterRegionNegativeCache.set(shootId, true);
    }
    return null;
  }

  const data = await response.json();
  clusterRegionCache.set(shootId, data);
  return data;
}

// Works out whether Joule is allowed on this cluster. Both the issuer and the
// region come from our side rather than the cluster, and if we can't be sure
// we treat it as a no.
async function checkJouleEligibility({ clusterUrl, oidcIssuerUrl }) {
  if (
    allowedIssuerUrl &&
    oidcIssuerUrl &&
    stripTrailingSlash(oidcIssuerUrl) !== stripTrailingSlash(allowedIssuerUrl)
  ) {
    return { eligible: false, reason: 'issuer-mismatch' };
  }
  if (!companionApiBaseUrl) {
    return { eligible: false, reason: 'not-configured' };
  }

  const shootId = extractShootId(clusterUrl ?? '');
  if (!shootId) return { eligible: false, reason: 'not-skr' };

  const region = await fetchClusterRegion(shootId);
  if (!region || typeof region.isEUAccessOnly !== 'boolean') {
    return { eligible: false, reason: 'unknown' };
  }
  if (region.isEUAccessOnly) return { eligible: false, reason: 'eu-access' };
  return { eligible: true };
}

async function handleJouleEligibility(req, res) {
  try {
    const { clusterUrl, oidcIssuerUrl } = extractAuthHeaders(req);
    const result = await checkJouleEligibility({ clusterUrl, oidcIssuerUrl });
    return res.status(200).json(result);
  } catch (error) {
    req.log.warn(error);
    return res.status(500).json({
      eligible: false,
      error: `Failed to determine Joule eligibility. Request ID: ${String(req.id)}`,
    });
  }
}

router.post('/public-key', handlePublicKey);
router.post(
  '/suggestions',
  requireCompanionCredential,
  companionRateLimiter,
  handlePromptSuggestions,
);
router.post(
  '/messages',
  requireCompanionCredential,
  companionRateLimiter,
  handleChatMessage,
);
router.post(
  '/followup',
  requireCompanionCredential,
  companionRateLimiter,
  handleFollowUpSuggestions,
);
router.post(
  '/joule-eligibility',
  requireCompanionCredential,
  companionRateLimiter,
  handleJouleEligibility,
);

export { handleJouleEligibility, handlePublicKey };
export default router;
