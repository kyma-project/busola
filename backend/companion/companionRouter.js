import express from 'express';
import { TokenManager } from './TokenManager';

const tokenManager = new TokenManager();

const router = express.Router();

router.use(express.json());

async function handleAIChatRequest(req, res) {
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
    console.error('Error in AI Chat proxy:', error);
    res.status(500).json({ error: 'Failed to fetch AI chat data' });
  }
}

router.post('/suggestions', handleAIChatRequest);

export default router;
