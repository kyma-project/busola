import { describe, it, expect, beforeEach } from 'vitest';
import { decideOidcCallbackAction } from '../utils/oidcCallbackDecision';
import { registerAuthRedirect } from '../utils/authRedirectLoopGuard';

const CLIENT_ID = 'busola-client';

function storeOidcState(stateId: string, clientId: string) {
  localStorage.setItem(
    `oidc.${stateId}`,
    JSON.stringify({ client_id: clientId }),
  );
}

describe('decideOidcCallbackAction', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('stops on an IdP error callback instead of redirecting again', () => {
    const decision = decideOidcCallbackAction(
      CLIENT_ID,
      '?error=access_denied&error_description=provisioning%20mismatch&state=s',
    );
    expect(decision).toEqual({
      action: 'stop-idp-error',
      failure: {
        error: 'access_denied',
        errorDescription: 'provisioning mismatch',
        fromIdp: true,
      },
    });
  });

  it("leaves another client's error callback to its owner", () => {
    storeOidcState('s1', 'someone-else');
    expect(
      decideOidcCallbackAction(CLIENT_ID, '?error=access_denied&state=s1'),
    ).toEqual({ action: 'foreign-callback' });
  });

  it('redirects when there is no callback and no loop', () => {
    expect(decideOidcCallbackAction(CLIENT_ID, '')).toEqual({
      action: 'redirect',
    });
  });

  it('stops when there is no callback but redirects keep looping', () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    expect(decideOidcCallbackAction(CLIENT_ID, '')).toEqual({
      action: 'stop-loop',
    });
  });

  it('processes a code callback that belongs to this client', () => {
    storeOidcState('s1', CLIENT_ID);
    expect(decideOidcCallbackAction(CLIENT_ID, '?code=abc&state=s1')).toEqual({
      action: 'process-callback',
    });
  });

  it('treats a code callback of another client as foreign', () => {
    storeOidcState('s1', 'someone-else');
    expect(decideOidcCallbackAction(CLIENT_ID, '?code=abc&state=s1')).toEqual({
      action: 'foreign-callback',
    });
    // Unknown state counts as foreign too, we must not consume someone else's code.
    expect(
      decideOidcCallbackAction(CLIENT_ID, '?code=abc&state=unknown'),
    ).toEqual({ action: 'foreign-callback' });
  });

  it('prefers stopping on an error even when a loop was detected', () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    const decision = decideOidcCallbackAction(CLIENT_ID, '?error=server_error');
    expect(decision.action).toBe('stop-idp-error');
  });
});
