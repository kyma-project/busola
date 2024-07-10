import { KubeconfigOIDCAuth, LoginCommand } from 'types';

const OIDC_PARAM_NAMES = new Map([
  ['--oidc-issuer-url', 'issuerUrl'],
  ['--oidc-client-id', 'clientId'],
  ['--oidc-client-secret', 'clientSecret'],
  ['--oidc-extra-scope', 'scope'],
]);

export function parseOIDCparams({ exec: commandData }: KubeconfigOIDCAuth) {
  if (!commandData || !commandData.args) throw new Error('No args provided');
  let output: any = {};

  commandData.args.forEach(arg => {
    const regex = new RegExp('^(?<key>[^=\\s]+)(?:=(?<value>.*$))');
    const match = arg.match(regex);

    if (!match) {
      return;
    }

    const argKey: string = match.groups?.key || '';
    const argValue: string = match.groups?.value || '';

    if (!OIDC_PARAM_NAMES.has(argKey)) return;

    const outputKey = OIDC_PARAM_NAMES.get(argKey)!;
    if (output[outputKey]) output[outputKey] += ' ' + argValue;
    else output[outputKey] = argValue;
  });

  return output;
}

export function tryParseOIDCparams(kubeconfigUser: KubeconfigOIDCAuth) {
  try {
    return parseOIDCparams(kubeconfigUser);
  } catch (_) {
    return null;
  }
}

export function createLoginCommand(
  oidcConfig: {
    issuerUrl: string;
    clientId: string;
    clientSecret?: string;
    scope: string;
  },
  execRest: object,
): LoginCommand {
  return {
    ...execRest,
    apiVersion: 'client.authentication.k8s.io/v1beta1',
    command: 'kubectl',
    args: [
      'oidc-login',
      'get-token',
      `--oidc-issuer-url=${oidcConfig.issuerUrl || ''}`,
      `--oidc-client-id=${oidcConfig.clientId || ''}`,
      `--oidc-client-secret=${oidcConfig.clientSecret || ''}`,
      oidcConfig.scope
        ? `--oidc-extra-scope=${oidcConfig.scope || ''}`
        : `--oidc-extra-scope=openid ${oidcConfig.scope || ''}`,
      '--grant-type=auto',
    ],
  };
}
