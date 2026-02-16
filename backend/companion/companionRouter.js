/* global require */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { TokenManager } from './TokenManager';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import escape from 'lodash.escape';

const config = require('../config.js');

const tokenManager = new TokenManager();
const COMPANION_API_BASE_URL = `${
  config.features?.KYMA_COMPANION?.config?.apiBaseUrl ?? ''
}/api/conversations/`;
const SKIP_AUTH = config.features?.KYMA_COMPANION?.config?.skipAuth ?? false;
const router = express.Router();

// Rate limiter: Max 200 requests per 1 minutes per IP
const companionRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(express.json());

function extractAuthHeaders(req) {
  return {
    clusterUrl: req.headers['x-cluster-url'],
    certificateAuthorityData:
      req.headers['x-cluster-certificate-authority-data'],
    clusterToken: req.headers['x-k8s-authorization']?.replace(
      /^Bearer\s+/i,
      '',
    ),
    clientCertificateData: req.headers['x-client-certificate-data'],
    clientKeyData: req.headers['x-client-key-data'],
    sessionId: req.headers['session-id'],
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
  const { namespace, resourceType, groupVersion, resourceName } = JSON.parse(
    req.body.toString(),
  );
  const authData = extractAuthHeaders(req);
  const endpointUrl = COMPANION_API_BASE_URL;
  const payload = {
    resource_kind: resourceType,
    resource_api_version: groupVersion,
    resource_name: resourceName,
    namespace: namespace,
  };

  try {
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
  const { query, namespace, resourceType, groupVersion, resourceName } =
    JSON.parse(req.body.toString());

  const authData = extractAuthHeaders(req);
  const conversationId = authData.sessionId;

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

  try {
    const uuidPattern = /^[a-f0-9]{32}$/i;
    if (!uuidPattern.test(conversationId)) {
      throw new Error('Invalid session ID ');
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
      res.status(error.status).json({
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

  const endpointUrl = new URL(
    `${encodeURIComponent(conversationId)}/questions`,
    COMPANION_API_BASE_URL,
  );

  try {
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
    res
      .status(500)
      .json({ error: `Failed to fetch AI chat data: ${error.message}` });
  }
}

router.post('/suggestions', companionRateLimiter, handlePromptSuggestions);
router.post('/messages', companionRateLimiter, handleChatMessage);
router.post('/followup', companionRateLimiter, handleFollowUpSuggestions);

export default router;
