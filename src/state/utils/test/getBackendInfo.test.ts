import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('getBackendInfo — getClusterConfig', () => {
  beforeEach(() => {
    // jsdom defaults window.location.hostname to '' — reset between tests
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hostname: 'localhost' },
    });
  });

  it('always returns backendAddress as /backend', async () => {
    const { getClusterConfig } = await import('../getBackendInfo');
    expect(getClusterConfig().backendAddress).toBe('/backend');
  });

  it('captures the hostname at module load time', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, hostname: 'my-cluster.example.com' },
    });

    // Reset modules so the module-level `domain` variable is re-evaluated
    // with the new hostname after we change window.location.hostname above
    vi.resetModules();
    const { getClusterConfig } = await import('../getBackendInfo');
    expect(getClusterConfig().domain).toBe('my-cluster.example.com');
  });

  it('returns a new object on each call (not a shared reference)', async () => {
    const { getClusterConfig } = await import('../getBackendInfo');
    const first = getClusterConfig();
    const second = getClusterConfig();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
