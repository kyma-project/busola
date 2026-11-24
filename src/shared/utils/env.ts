import joinPaths from './path';

export enum Envs {
  ENVIRONMENT = 'ENVIRONMENT',
  SSO_LOGIN_BYPASS = 'SSO_LOGIN_BYPASS',
}

export async function getEnvs(): Promise<Map<string, string>> {
  return readEnv(await fetchActiveEnv());
}

export async function getConfigDir(): Promise<string> {
  return toConfigDir((await getEnvs()).get(Envs.ENVIRONMENT));
}

export function toConfigDir(environment?: string): string {
  return environment ? joinPaths('environments', environment) : '';
}

function readEnv(input: string): Map<string, string> {
  return new Map(
    input.split('\n').map((value) => {
      const envVar = value.trim().split('=');
      if (envVar?.length === 2 && envVar[1]) {
        return [envVar[0], envVar[1]];
      }
      return ['', ''];
    }),
  );
}

async function fetchActiveEnv(): Promise<string> {
  const envResponse = await fetch('/active.env');
  return envResponse.text();
}
