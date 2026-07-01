import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('getBackendInfo — getClusterConfig', () => {
  beforeEach(() => {
    vi.resetModules();
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
