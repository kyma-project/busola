import { describe, it, expect } from 'vitest';

// Lint-style fence. Do not re-add the 2-second `navigate(0)` reload that
// used to live in ClusterRoutes.jsx: it fired during every silent-renew
// transient and produced the flash-and-redirect loop reported in #5101.

describe('ClusterRoutes does not force-reload on auth transient', () => {
  it('does not schedule a setTimeout that calls navigate(0)', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/components/App/ClusterRoutes.jsx', 'utf8');
    expect(src).not.toMatch(/navigate\(0/);
  });
});
