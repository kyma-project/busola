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
});
