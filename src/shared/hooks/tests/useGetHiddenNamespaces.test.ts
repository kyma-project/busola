import { renderHook } from '@testing-library/react';
import { useGetHiddenNamespaces } from '../useGetHiddenNamespaces';

let featureValue;
vi.mock('hooks/useFeature', () => ({
  useFeature: () => featureValue,
}));

beforeEach(() => {
  featureValue = { isEnabled: false };
});

describe('useGetHiddenNamespaces', () => {
  it('returns the configured namespaces when the feature is enabled', () => {
    featureValue = {
      isEnabled: true,
      config: { namespaces: ['kube-system', 'istio-system'] },
    };

    const { result } = renderHook(() => useGetHiddenNamespaces());

    expect(result.current).toEqual(['kube-system', 'istio-system']);
  });

  it('returns an empty array when the feature is disabled', () => {
    featureValue = {
      isEnabled: false,
      config: { namespaces: ['kube-system'] },
    };

    const { result } = renderHook(() => useGetHiddenNamespaces());

    expect(result.current).toEqual([]);
  });

  it('returns an empty array when namespaces config is not an array', () => {
    featureValue = { isEnabled: true, config: { namespaces: 'not-an-array' } };

    const { result } = renderHook(() => useGetHiddenNamespaces());

    expect(result.current).toEqual([]);
  });
});
