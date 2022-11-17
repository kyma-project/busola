export const OIDC_PARAM_NAMES = new Map([
  ['--oidc-issuer-url', 'issuerUrl'],
  ['--oidc-client-id', 'clientId'],
  ['--oidc-client-secret', 'clientSecret'],
  ['--oidc-extra-scope', 'scope'],
]);

type LoginCommand = {
  args: string[];
};

// rename exec to commandData
export function parseOIDCParams({ exec: commandData }: { exec: LoginCommand }) {
  if (!commandData || !commandData.args) throw new Error('No args provided');
  let output: any = {};

  commandData.args.forEach(arg => {
    const [argKey, argValue] = arg.split('=');
    if (!OIDC_PARAM_NAMES.has(argKey)) return;

    const outputKey = OIDC_PARAM_NAMES.get(argKey)!;
    if (output[outputKey]) output[outputKey] += ' ' + argValue;
    else output[outputKey] = argValue;
  });

  return output;
}
