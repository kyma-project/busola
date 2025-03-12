import express from 'express';
import { TokenManager } from './TokenManager';

const tokenManager = new TokenManager();

const router = express.Router();

router.use(express.json());

async function handlePromptSuggestions(req, res) {
  const { namespace, resourceType, groupVersion, resourceName } = JSON.parse(
    req.body.toString(),
  );
  const clusterUrl = req.headers['x-cluster-url'];
  const certificateAuthorityData =
    req.headers['x-cluster-certificate-authority-data'];
  const clusterToken = req.headers['x-k8s-authorization']?.replace(
    /^Bearer\s+/i,
    '',
  );
  const clientCertificateData = req.headers['x-client-certificate-data'];
  const clientKeyData = req.headers['x-client-key-data'];

  try {
    const url = 'https://companion.cp.dev.kyma.cloud.sap/api/conversations/';
    const payload = {
      resource_kind: resourceType,
      resource_api_version: groupVersion,
      resource_name: resourceName,
      namespace: namespace,
    };

    const AUTH_TOKEN = await tokenManager.getToken();

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
      'X-Cluster-Url': clusterUrl,
    };

    if (clusterToken) {
      headers['X-K8s-Authorization'] = clusterToken;
    } else if (clientCertificateData && clientKeyData) {
      headers['X-Client-Certificate-Data'] = clientCertificateData;
      headers['X-Client-Key-Data'] = clientKeyData;
    } else {
      throw new Error('Missing authentication credentials');
    }

    const response = await fetch(url, {
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
    res.status(500).json({ error: 'Failed to fetch AI chat data' });
  }
}

async function handleChatMessage(req, res) {
  const {
    query,
    namespace,
    resourceType,
    groupVersion,
    resourceName,
  } = JSON.parse(req.body.toString());
  const clusterUrl = req.headers['x-cluster-url'];
  const certificateAuthorityData =
    req.headers['x-cluster-certificate-authority-data'];
  const clusterToken = req.headers['x-k8s-authorization']?.replace(
    /^Bearer\s+/i,
    '',
  );
  const clientCertificateData = req.headers['x-client-certificate-data'];
  const clientKeyData = req.headers['x-client-key-data'];
  const sessionId = req.headers['session-id'];
  const conversationId = sessionId;

  try {
    const uuidPattern = /^[a-f0-9]{32}$/i;
    if (!uuidPattern.test(conversationId)) {
      throw new Error('Invalid session ID ');
    }
    const baseUrl =
      'https://companion.cp.dev.kyma.cloud.sap/api/conversations/';
    const targetUrl = new URL(
      `${encodeURIComponent(conversationId)}/messages`,
      baseUrl,
    );

    const payload = {
      query,
      resource_kind: resourceType,
      resource_api_version: groupVersion,
      resource_name: resourceName,
      namespace: namespace,
    };

    const AUTH_TOKEN = await tokenManager.getToken();

    // Set up headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const headers = {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
      'X-Cluster-Url': clusterUrl,
      'Session-Id': sessionId,
    };

    if (clusterToken) {
      headers['X-K8s-Authorization'] = clusterToken;
    } else if (clientCertificateData && clientKeyData) {
      headers['X-Client-Certificate-Data'] = clientCertificateData;
      headers['X-Client-Key-Data'] = clientKeyData;
    } else {
      throw new Error('Missing authentication credentials');
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI chat data' });
  }
}

async function handleFollowUpSuggestions(req, res) {
  console.log('handleFollowUpSuggestions', req, res);

  const clusterUrl = req.headers['x-cluster-url'];
  const certificateAuthorityData =
    req.headers['x-cluster-certificate-authority-data'];
  const clusterToken = req.headers['x-k8s-authorization']?.replace(
    /^Bearer\s+/i,
    '',
  );
  const clientCertificateData = req.headers['x-client-certificate-data'];
  const clientKeyData = req.headers['x-client-key-data'];
  const sessionId = req.headers['session-id'];
  const conversationId = sessionId;

  try {
    const baseUrl =
      'https://companion.cp.dev.kyma.cloud.sap/api/conversations/';
    const targetUrl = new URL(
      `${encodeURIComponent(conversationId)}/questions`,
      baseUrl,
    );

    const AUTH_TOKEN = await tokenManager.getToken();

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
      'X-Cluster-Url': clusterUrl,
      'Session-Id': sessionId,
    };

    if (clusterToken) {
      headers['X-K8s-Authorization'] = clusterToken;
    } else if (clientCertificateData && clientKeyData) {
      headers['X-Client-Certificate-Data'] = clientCertificateData;
      headers['X-Client-Key-Data'] = clientKeyData;
    } else {
      throw new Error('Missing authentication credentials');
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    res.json({
      promptSuggestions: data?.questions,
      conversationId: data?.conversation_id,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI chat data' });
  }
}

router.post('/suggestions', handlePromptSuggestions);
router.post('/messages', handleChatMessage);
router.post('/followup', handleFollowUpSuggestions);

export default router;
