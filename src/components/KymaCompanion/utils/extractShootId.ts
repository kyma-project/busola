// Kyma SKR API hosts: `api.<shoot>.<...>.kyma.<...>`.
export function extractShootId(serverUrl: string): string | null {
  try {
    const parts = new URL(serverUrl).hostname.split('.');
    if (parts[0] !== 'api' || parts.length <= 2) return null;
    if (!parts.slice(2).includes('kyma')) return null;
    return parts[1];
  } catch {
    return null;
  }
}
