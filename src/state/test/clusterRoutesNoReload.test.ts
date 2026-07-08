import { describe, it, expect } from 'vitest';

// This test guards against re-introducing the 2-second `navigate(0)` reload
// that previously lived inside ClusterRoutes.jsx (lines 58–77). That reload
// tripped on every silent-renew transient (auth becomes null for ~500ms while
// a new token is minted) and manifested as a "flash + redirect loop".
// After removal, no code in ClusterRoutes should call `navigate(0)`.

describe('ClusterRoutes does not force-reload on auth transient', () => {
  it('does not schedule a setTimeout that calls navigate(0)', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/components/App/ClusterRoutes.jsx', 'utf8');
    expect(src).not.toMatch(/navigate\(0/);
  });
});
