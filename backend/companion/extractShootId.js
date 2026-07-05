// A Kyma SKR API URL looks like api.<shoot>.<...>.kyma.<...>, so the shoot ID
// is the second label of the hostname.
export function extractShootId(serverUrl) {
  try {
    const parts = new URL(serverUrl).hostname.split('.');
    if (parts[0] !== 'api' || parts.length <= 2) return null;
    if (!parts.slice(2).includes('kyma')) return null;
    return parts[1];
  } catch {
    return null;
  }
}
