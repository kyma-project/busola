export async function getKcpToken() {
  const tokenUrl = 'https://kymatest.accounts400.ondemand.com/oauth2/token';
  const grantType = 'client_credentials';
  const clientId =
    process.env.COMPANION_KCP_AUTH_CLIENT_SECRET ??
    getLocalCredentials()?.clientId;
  const clientSecret =
    process.env.COMPANION_KCP_AUTH_CLIENT_ID ??
    getLocalCredentials()?.clientSecret;

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
    console.warn('Local credentials file not found or could not be read');
    return null;
  }
}
