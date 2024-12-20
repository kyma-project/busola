import joinPaths from './path';

export enum Envs {
  BACKEND_URL = 'BACKEND_URL',
  ENVIRONMENT = 'ENVIRONMENT',
}

export default async function getEnv(env: Envs): Promise<string> {
  const input = await fetchActiveEnv();
  const envs = readEnv(input);
  const desiredEnv = envs.get(env);
  return desiredEnv ? desiredEnv : '';
}

export async function getConfigDir(): Promise<string> {
  const environment = await getEnv(Envs.ENVIRONMENT);
  if (environment) {
    return joinPaths('environments', environment);
  }
  return '';
}

function readEnv(input: string): Map<string, string> {
  return new Map(
    input.split('\n').map(value => {
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
