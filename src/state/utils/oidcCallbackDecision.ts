import { isAuthRedirectLoop } from './authRedirectLoopGuard';

export type OidcErrorParams = {
  error: string;
  errorDescription?: string;
  // Only set when the error came from an IdP callback, not from a local failure.
  fromIdp?: boolean;
};

export type OidcCallbackDecision =
  | { action: 'process-callback' } // our code callback, finish login
  | { action: 'foreign-callback' } // not ours, let the other manager handle it
  | { action: 'redirect' } // no callback yet, start one
  | { action: 'stop-idp-error'; failure: OidcErrorParams } // IdP returned an error, show it
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

  const error = params.get('error');
  if (error) {
    // Keep the error unless its state clearly belongs to another client.
    return owner && owner !== clientId
      ? { action: 'foreign-callback' }
      : {
          action: 'stop-idp-error',
          failure: {
            error,
            errorDescription: params.get('error_description') ?? undefined,
            fromIdp: true,
          },
        };
  }

  if (!params.has('code')) {
    return isAuthRedirectLoop()
      ? { action: 'stop-loop' }
      : { action: 'redirect' };
  }

  return owner === clientId
    ? { action: 'process-callback' }
    : { action: 'foreign-callback' };
}

// Logs and reports the two stop cases, returns true if the login has to stop.
export function reportStoppedLogin(
  decision: OidcCallbackDecision,
  flow: string,
  onLoginFailed?: (failure?: OidcErrorParams) => void,
): boolean {
  if (decision.action === 'stop-idp-error') {
    console.error(
      `${flow} login stopped, the IdP returned an error:`,
      decision.failure.error,
      decision.failure.errorDescription,
    );
    onLoginFailed?.(decision.failure);
    return true;
  }
  if (decision.action === 'stop-loop') {
    console.error(`${flow} login stopped: redirect loop detected`);
    onLoginFailed?.();
    return true;
  }
  return false;
}
