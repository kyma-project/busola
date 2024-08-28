import joinPaths from './path';

export default async function getConfigDir(): Promise<string> {
  const input = await fetchActiveEnv();
  const envVar = input.trim().split('=');
  if (envVar?.length === 2 && envVar[1]) {
    const envDir = envVar[1].trim();
    return joinPaths('environment', envDir);
  }
  return '';
}

async function fetchActiveEnv(): Promise<string> {
  const envResponse = await fetch('/active.env');
  return envResponse.text();
}
