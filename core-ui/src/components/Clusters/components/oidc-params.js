const OIDC_PARAM_NAMES = new Map([
  ['--oidc-issuer-url', 'issuerUrl'],
  ['--oidc-client-id', 'clientId'],
  ['--oidc-extra-scope', 'scope'],
]);

export function parseOIDCparams({ exec: commandData }) {
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

export function tryParseOIDCparams(kubeconfigUser) {
  try {
    return parseOIDCparams(kubeconfigUser);
  } catch (_) {
    return null;
  }
}

export function createLoginCommand(oidcConfig) {
  return {
    apiVersion: 'client.authentication.k8s.io/v1beta1',
    command: 'kubectl',
    args: [
      'oidc-login',
      'get-token',
      `--oidc-issuer-url=${oidcConfig.issuerUrl || ''}`,
      `--oidc-client-id=${oidcConfig.clientId || ''}`,
      `--oidc-extra-scope=openid ${oidcConfig.scope || ''}`,
      '--grant-type=auto',
    ],
  };
}
