import express from 'express';
const router = express.Router();

router.use(express.json());

async function handleAIChatRequest(req, res) {
  const { namespace, resourceType, groupVersion, resourceName } = JSON.parse(
    req.body.toString(),
  );
  const clusterUrl = req.headers['x-cluster-url'];
  const clusterToken = req.headers['x-k8s-authorization'].replace(
    /^Bearer\s+/i,
    '',
  );
  const certificateAuthorityData =
    req.headers['x-cluster-certificate-authority-data'];

  try {
    const url = 'https://companion.cp.dev.kyma.cloud.sap/api/conversations/';
    const payload = {
      resource_kind: resourceType,
      resource_api_version: groupVersion,
      resource_name: resourceName,
      namespace: namespace,
    };

    const AUTH_TOKEN = '<AUTH_TOKEN>';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
        'X-Cluster-Url': clusterUrl,
        'X-K8s-Authorization': clusterToken,
      },
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
