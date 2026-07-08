import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const SRC = 'src/state/ssoDataAtom.tsx';

describe('SSO failure path preserves location', () => {
  it('does not reload the whole page on token-expiration failure', () => {
    const src = readFileSync(SRC, 'utf8');
    // Full-page reload loses the user's location. Recovery goes through
    // saveIntendedPath + signinRedirect instead.
    expect(src).not.toMatch(/window\.location\.reload/);
  });

  it('imports saveIntendedPath so it can preserve location before IdP round-trip', () => {
    const src = readFileSync(SRC, 'utf8');
    expect(src).toMatch(/saveIntendedPath/);
  });
});
