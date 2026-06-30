// Kyma SKR API server URLs follow the pattern https://api.{shoot-id}.{domain...}
export function extractShootId(serverUrl: string): string | null {
  try {
    const parts = new URL(serverUrl).hostname.split('.');
    if (parts[0] === 'api' && parts.length > 2) {
      return parts[1];
    }
    return null;
  } catch {
    return null;
  }
}
