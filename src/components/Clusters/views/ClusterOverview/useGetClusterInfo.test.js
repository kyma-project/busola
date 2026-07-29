import { renderHook } from '@testing-library/react';
import { useGetClusterInfo } from './useGetClusterInfo';

const mockUseGet = vi.fn();

vi.mock('shared/hooks/BackendAPI/useGet', () => ({
  useGet: (...args) => mockUseGet(...args),
}));

function setupMocks({
  shootInfo = null,
  shootInfoLoading = false,
  kymaInfo = null,
  kymaProvisioningInfo = null,
} = {}) {
  mockUseGet.mockImplementation((path) => {
    if (path === '/api/v1/namespaces/kube-system/configmaps/shoot-info')
      return { data: shootInfo, loading: shootInfoLoading };
    if (path === '/api/v1/namespaces/kyma-system/configmaps/kyma-info')
      return { data: kymaInfo, loading: false };
    if (
      path ===
      '/api/v1/namespaces/kyma-system/configmaps/kyma-provisioning-info'
    )
      return { data: kymaProvisioningInfo, loading: false };
    return { data: null, loading: false };
  });
}

describe('useGetClusterInfo', () => {
  beforeEach(() => {
    mockUseGet.mockReset();
  });

  it('returns loading:true while any CM fetch is in progress', () => {
    setupMocks({ shootInfoLoading: true });
    const { result } = renderHook(() => useGetClusterInfo());
    expect(result.current.loading).toBe(true);
    expect(result.current.clusterInfo).toBeUndefined();
  });

  it('merges shoot-info flat data into clusterInfo', () => {
    const shootData = {
      provider: 'azure',
      region: 'uksouth',
      egressCIDRs: '1.2.3.4/32',
    };
    setupMocks({ shootInfo: { data: shootData } });
    const { result } = renderHook(() => useGetClusterInfo());
    expect(result.current.clusterInfo).toMatchObject({ provider: 'azure' });
  });

  it('parses kyma-provisioning-info details YAML and merges all fields into clusterInfo', () => {
    const details =
      'globalAccountID: ga-1\nsubaccountID: sa-2\nregion: uksouth\n';
    setupMocks({ kymaProvisioningInfo: { data: { details } } });
    const { result } = renderHook(() => useGetClusterInfo());
    expect(result.current.clusterInfo).toMatchObject({
      globalAccountID: 'ga-1',
      subaccountID: 'sa-2',
      region: 'uksouth',
    });
  });

  it('returns an empty clusterInfo without crashing when all CMs are absent', () => {
    setupMocks();
    const { result } = renderHook(() => useGetClusterInfo());
    expect(result.current.loading).toBe(false);
    expect(result.current.clusterInfo).toBeDefined();
  });

  it('ignores malformed YAML in kyma-provisioning-info without crashing', () => {
    setupMocks({
      kymaProvisioningInfo: { data: { details: '{invalid: yaml: [}' } },
    });
    const { result } = renderHook(() => useGetClusterInfo());
    expect(result.current.loading).toBe(false);
    expect(result.current.clusterInfo).toBeDefined();
  });
});
