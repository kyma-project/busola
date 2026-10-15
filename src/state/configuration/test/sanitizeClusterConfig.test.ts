import { describe, it, expect, vi, afterEach } from 'vitest';

import {
  sanitizeClusterConfig,
  CLUSTER_IMMUTABLE_FEATURES,
} from '../sanitizeClusterConfig';

describe('sanitizeClusterConfig', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes EXTENSIBILITY_CUSTOM_COMPONENTS supplied by the cluster', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = sanitizeClusterConfig({
      features: {
        EXTENSIBILITY_CUSTOM_COMPONENTS: { isEnabled: true },
      },
    });

    expect(result?.features).not.toHaveProperty(
      'EXTENSIBILITY_CUSTOM_COMPONENTS',
    );
  });

  it('removes every security-sensitive feature flag the cluster tries to set', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const features = Object.fromEntries(
      CLUSTER_IMMUTABLE_FEATURES.map((name) => [name, { isEnabled: true }]),
    );

    const result = sanitizeClusterConfig({ features } as any);

    for (const name of CLUSTER_IMMUTABLE_FEATURES) {
      expect(result?.features).not.toHaveProperty(name);
    }
  });

  it('keeps non-security feature flags from the cluster', () => {
    const result = sanitizeClusterConfig({
      features: {
        EXTENSIBILITY: { isEnabled: false },
        COMMUNITY_MODULES: { isEnabled: true },
      },
    });

    expect(result?.features).toEqual({
      EXTENSIBILITY: { isEnabled: false },
      COMMUNITY_MODULES: { isEnabled: true },
    });
  });

  it('keeps non-feature config keys untouched', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = sanitizeClusterConfig({
      storageType: 'localStorage',
      features: { EXTENSIBILITY_CUSTOM_COMPONENTS: { isEnabled: true } },
    } as any);

    expect(result?.storageType).toBe('localStorage');
  });

  it('does not mutate the input object', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const input = {
      features: { EXTENSIBILITY_CUSTOM_COMPONENTS: { isEnabled: true } },
    };

    sanitizeClusterConfig(input);

    expect(input.features.EXTENSIBILITY_CUSTOM_COMPONENTS).toEqual({
      isEnabled: true,
    });
  });

  it('warns when it strips a security-sensitive flag', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    sanitizeClusterConfig({
      features: { HIDDEN_NAMESPACES: { isEnabled: true } },
    });

    expect(warn).toHaveBeenCalled();
  });

  it('does not warn when the cluster supplies no security-sensitive flags', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    sanitizeClusterConfig({
      features: { EXTENSIBILITY: { isEnabled: true } },
    });

    expect(warn).not.toHaveBeenCalled();
  });

  it.each([null, undefined, {}, { features: undefined }])(
    'handles empty/edge input without throwing: %o',
    (input) => {
      expect(() => sanitizeClusterConfig(input as any)).not.toThrow();
    },
  );
});
