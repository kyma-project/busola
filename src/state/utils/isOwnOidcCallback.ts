// The `iss` param is unreliable — some IdPs omit it.
export function isOwnOidcCallback(clientId: string): boolean {
  const stateId = new URLSearchParams(window.location.search).get('state');
  if (!stateId) return false;
  try {
    const raw = localStorage.getItem(`oidc.${stateId}`);
    if (!raw) return false;
    return JSON.parse(raw)?.client_id === clientId;
  } catch {
    return false;
  }
}
