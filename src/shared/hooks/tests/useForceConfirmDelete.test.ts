import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useForceConfirmDelete } from '../useForceConfirmDelete';

let featureValue: {
  isEnabled?: boolean;
  config?: { resources: { kind: string }[] };
};

vi.mock('hooks/useFeature', () => ({
  useFeature: () => featureValue,
}));

beforeEach(() => {
  featureValue = { isEnabled: false };
});

describe('useForceConfirmDelete', () => {
  it('returns false when the feature is disabled', () => {
    featureValue = {
      isEnabled: false,
      config: { resources: [{ kind: 'Namespace' }] },
    };

    const { result } = renderHook(() => useForceConfirmDelete('Namespaces'));

    expect(result.current).toBe(false);
  });

  it('matches a standard resource whose resourceType is a PascalCase plural', () => {
    featureValue = {
      isEnabled: true,
      config: {
        resources: [{ kind: 'Namespace' }, { kind: 'ServiceInstance' }],
      },
    };

    const { result } = renderHook(() => useForceConfirmDelete('Namespaces'));

    expect(result.current).toBe(true);
  });

  it('matches an extensibility resource whose resourceType is a lowercase plural URL path', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ kind: 'RedisInstance' }] },
    };

    const { result } = renderHook(() =>
      useForceConfirmDelete('redisinstances'),
    );

    expect(result.current).toBe(true);
  });

  it('returns false when the feature is enabled but resourceType does not match any configured kind', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ kind: 'Namespace' }] },
    };

    const { result } = renderHook(() => useForceConfirmDelete('Pods'));

    expect(result.current).toBe(false);
  });

  it('returns false when resourceType is undefined', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ kind: 'Namespace' }] },
    };

    const { result } = renderHook(() => useForceConfirmDelete(undefined));

    expect(result.current).toBe(false);
  });

  it('returns false when the feature has no config', () => {
    featureValue = { isEnabled: true };

    const { result } = renderHook(() => useForceConfirmDelete('Namespaces'));

    expect(result.current).toBe(false);
  });
});
