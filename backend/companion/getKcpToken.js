export async function getKcpToken() {
  const tokenUrl = 'https://kymatest.accounts400.ondemand.com/oauth2/token';
  const grantType = 'client_credentials';

  const localCredentials = getLocalCredentials();
  const secretManagerCredentials = getSecretManagerCredentials();

  const clientId =
    secretManagerCredentials?.clientId ?? localCredentials?.clientId;
  const clientSecret =
    secretManagerCredentials?.clientSecret ?? localCredentials?.clientSecret;

  if (!clientId) {
    throw new Error('COMPANION_KCP_AUTH_CLIENT_ID is not set');
  }
  if (!clientSecret) {
    throw new Error('COMPANION_KCP_AUTH_CLIENT_SECRET is not set');
  }

  // Prepare request data
  const requestBody = new URLSearchParams();
  requestBody.append('grant_type', grantType);

  // Prepare authorization header
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  );

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error(`Failed to fetch token: ${error.message}`);
  }
}

function getLocalCredentials() {
  const fs = require('fs');
  try {
    return JSON.parse(fs.readFileSync('companion/credentials.json', 'utf8'));
  } catch (error) {
    return null;
  }
}

function getSecretManagerCredentials() {
  const fs = require('fs');
  try {
    return {
      clientId: fs
        .readFileSync('/secrets/companion_kcp_auth_client_id', 'utf8')
        .trim(),
      clientSecret: fs
        .readFileSync('/secrets/companion_kcp_auth_client_secret', 'utf8')
        .trim(),
    };
  } catch (error) {
    return null;
  }
}
