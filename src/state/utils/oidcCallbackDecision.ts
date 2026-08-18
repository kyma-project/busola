import { isAuthRedirectLoop } from './authRedirectLoopGuard';

export type OidcCallbackDecision =
  | { action: 'process-callback' } // our code callback, finish login
  | { action: 'foreign-callback' } // not ours, let the other manager handle it
  | { action: 'redirect' } // no callback yet, start one
  | { action: 'stop-loop' }; // redirect loop, stop trying

// The iss param is unreliable, some IdPs don't send it, so callbacks get
// matched to their flow through the stored oidc state entry instead.
function getCallbackOwner(stateId: string | null): string | null {
  if (!stateId) return null;
  try {
    const raw = localStorage.getItem(`oidc.${stateId}`);
    return raw ? (JSON.parse(raw)?.client_id ?? null) : null;
  } catch {
    return null;
  }
}

// One shared decision point for the SSO and the cluster OIDC flow.
export function decideOidcCallbackAction(
  clientId: string,
  search: string = window.location.search,
): OidcCallbackDecision {
  const params = new URLSearchParams(search);
  const owner = getCallbackOwner(params.get('state'));

  if (!params.has('code')) {
    return isAuthRedirectLoop()
      ? { action: 'stop-loop' }
      : { action: 'redirect' };
  }

  return owner === clientId
    ? { action: 'process-callback' }
    : { action: 'foreign-callback' };
}

// Logs and reports the loop stop case, returns true if the login has to stop.
export function reportStoppedLogin(
  decision: OidcCallbackDecision,
  flow: string,
  onLoginFailed?: () => void,
): boolean {
  if (decision.action === 'stop-loop') {
    console.error(`${flow} login stopped: redirect loop detected`);
    onLoginFailed?.();
    return true;
  }
  return false;
}
