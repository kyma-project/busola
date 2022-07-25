const OIDC_PARAM_NAMES = new Map([
  ['--oidc-issuer-url', 'issuerUrl'],
  ['--oidc-client-id', 'clientId'],
  ['--oidc-client-secret', 'clientSecret'],
  ['--oidc-extra-scope', 'scope'],
]);

export function parseOIDCParams({ exec: commandData }) {
  if (!commandData || !commandData.args) throw new Error('No args provided');
  let output = {};

  commandData.args.forEach(arg => {
    const [argKey, argValue] = arg.split('=');
    if (!OIDC_PARAM_NAMES.has(argKey)) return;

    const outputKey = OIDC_PARAM_NAMES.get(argKey);
    if (output[outputKey]) output[outputKey] += ' ' + argValue;
    else output[outputKey] = argValue;
  });

  return output;
}

export function createLoginCommand(oidcConfig) {
  return {
    apiVersion: 'client.authentication.k8s.io/v1beta1',
    command: 'kubectl',
    args: [
      'oidc-login',
      'get-token',
      `--oidc-issuer-url=${oidcConfig.issuerUrl}`,
      `--oidc-client-id=${oidcConfig.clientId}`,
      `--oidc-client-secret=${oidcConfig.clientSecret}`,
      `--oidc-extra-scope=openid ${oidcConfig.scope}`,
      '--grant-type=auto',
    ],
  };
}
