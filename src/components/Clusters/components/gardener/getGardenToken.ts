import { KubeconfigOIDCAuth, ValidKubeconfig } from 'types';

export function getGardenServer(kc: ValidKubeconfig): string | undefined {
  return kc?.clusters?.[0]?.cluster?.server;
}

export function getGardenStaticToken(kc: ValidKubeconfig): string | null {
  const user = kc?.users?.[0]?.user;
  if (user && 'token' in user && user.token) return user.token as string;
  return null;
}

export function isGardenOidc(kc: ValidKubeconfig): boolean {
  const user = kc?.users?.[0]?.user;
  return !!(user && !('token' in user) && (user as KubeconfigOIDCAuth).exec);
}
