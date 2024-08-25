import { KubeconfigOIDCAuth, LoginCommand } from 'types';

const OIDC_PARAM_NAMES = new Map([
  ['--oidc-issuer-url', 'issuerUrl'],
  ['--oidc-client-id', 'clientId'],
  ['--oidc-client-secret', 'clientSecret'],
  ['--oidc-extra-scope', 'scopes'],
]);

export function parseOIDCparams({ exec: commandData }: KubeconfigOIDCAuth) {
  if (!commandData || !commandData.args) throw new Error('No args provided');
  let output: any = {};

  commandData.args.forEach(arg => {
    /**
     * The regular expression defined below is tailored to parse command line arguments, capturing both arguments that
     * include values and those without values. The regex facilitates the extraction of both the keys and optionally
     * associated values in a reliable manner.
     *
     * Examples of command line arguments that this regex will match:
     * - With value: `--param-with-value=abc`
     * - Without value: `--param-without-value`
     *
     * The regular expression uses named groups (`key` for the argument and `value` for its associated value, if any)
     * to provide clear and convenient access to parts of the matched text.
     *
     * For an interactive example that demonstrates this regex pattern with various inputs and explains each part of the
     * expression in detail, visit the provided link: https://regex101.com/r/3hc8qX/2
     */
    const regex = new RegExp('^(?<key>[^=]+)(?:=(?<value>.*$))');
    const match = arg.match(regex);

    if (!match) {
      return;
    }

    const argKey: string = match.groups?.key || '';
    const argValue: string = match.groups?.value || '';

    if (!OIDC_PARAM_NAMES.has(argKey)) return;

    const outputKey = OIDC_PARAM_NAMES.get(argKey)!;
    if (output[outputKey]) {
      if (outputKey === 'scopes') {
        output[outputKey].push(argValue);
      } else {
        output[outputKey] += ' ' + argValue;
      }
    } else {
      if (outputKey === 'scopes') {
        output[outputKey] = [argValue];
      } else {
        output[outputKey] = argValue;
      }
    }
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
    scopes: string[];
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
      ...(oidcConfig.scopes?.length
        ? oidcConfig.scopes.map(scope => `--oidc-extra-scope=${scope || ''}`)
        : [`--oidc-extra-scope=openid`]),
      '--grant-type=auto',
    ],
  };
}
