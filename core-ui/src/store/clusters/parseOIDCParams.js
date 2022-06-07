export const OIDC_PARAM_NAMES = new Map([
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
