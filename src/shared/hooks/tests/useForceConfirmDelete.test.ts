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
      config: { resources: [{ kind: 'Namespaces' }] },
    };

    const { result } = renderHook(() => useForceConfirmDelete('Namespaces'));

    expect(result.current).toBe(false);
  });

  it('returns true when the feature is enabled and resourceType matches a configured kind', () => {
    featureValue = {
      isEnabled: true,
      config: {
        resources: [{ kind: 'Namespaces' }, { kind: 'ServiceInstances' }],
      },
    };

    const { result } = renderHook(() => useForceConfirmDelete('Namespaces'));

    expect(result.current).toBe(true);
  });

  it('returns false when the feature is enabled but resourceType does not match any configured kind', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ kind: 'Namespaces' }] },
    };

    const { result } = renderHook(() => useForceConfirmDelete('Pods'));

    expect(result.current).toBe(false);
  });

  it('returns false when resourceType is undefined', () => {
    featureValue = {
      isEnabled: true,
      config: { resources: [{ kind: 'Namespaces' }] },
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
