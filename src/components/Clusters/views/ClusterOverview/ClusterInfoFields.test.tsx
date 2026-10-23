import { describe, it, expect, vi } from 'vitest';
import { isValidElement, ReactElement, ReactNode } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import { useClusterInfoFields } from './ClusterInfoFields';
import { ClusterInfo } from './useGetClusterInfo';

const mockUseGetClusterInfo = vi.fn();

vi.mock('./useGetClusterInfo', () => ({
  useGetClusterInfo: () => mockUseGetClusterInfo(),
}));

const fullInfo: ClusterInfo = {
  provider: 'gcp',
  region: 'europe-west3',
  seedRegion: 'europe-west1',
  platformRegion: 'cf-eu10-canary',
  networkDetails: { dualStackIPEnabled: false },
  globalAccountID: 'ga-from-cm',
  subaccountID: 'sa-from-cm',
  environmentInstanceID: 'env-1',
  instanceName: 'instance-1',
  natGatewayIps: ['1.2.3.4'],
};

function getGroups(
  clusterInfo: ClusterInfo,
  { loading = false, kymaResourceLabels = {} } = {},
) {
  mockUseGetClusterInfo.mockReturnValue({ clusterInfo, loading });
  const { result } = renderHook(() => useClusterInfoFields(kymaResourceLabels));
  return result.current;
}

const keys = (fields: ReactNode[]) =>
  (fields.filter(isValidElement) as ReactElement[]).map((field) => field.key);

describe('useClusterInfoFields', () => {
  it('returns empty groups while loading', () => {
    const groups = getGroups(fullInfo, { loading: true });
    expect(groups.infrastructure).toEqual([]);
    expect(groups.btpAccount).toEqual([]);
    expect(groups.network).toEqual([]);
  });

  it('groups infrastructure fields in display order', () => {
    expect(keys(getGroups(fullInfo).infrastructure)).toEqual([
      'provider',
      'region',
      'platform-region',
      'dual-stack-ip',
      'seed-region',
    ]);
  });

  it('groups BTP account fields in display order', () => {
    expect(keys(getGroups(fullInfo).btpAccount)).toEqual([
      'global-account-id',
      'subaccount-id',
      'environment-instance-id',
      'instance-name',
    ]);
  });

  it('groups network fields', () => {
    expect(keys(getGroups(fullInfo).network)).toEqual(['nat-gateway-ips']);
  });

  it('returns only the fields clusterInfo has', () => {
    const groups = getGroups({
      region: 'europe-west3',
      natGatewayIps: ['1.2.3.4'],
    });
    expect(keys(groups.infrastructure)).toEqual(['region']);
    expect(keys(groups.btpAccount)).toEqual([]);
    expect(keys(groups.network)).toEqual(['nat-gateway-ips']);
  });

  it('renders the dual stack IP as an Enabled badge', () => {
    render(
      <>
        {
          getGroups({ networkDetails: { dualStackIPEnabled: true } })
            .infrastructure
        }
      </>,
    );
    expect(
      screen.getByText('clusters.overview.dual-stack-enabled'),
    ).toBeInTheDocument();
  });

  it('renders the dual stack IP as a Disabled badge', () => {
    render(
      <>
        {
          getGroups({ networkDetails: { dualStackIPEnabled: false } })
            .infrastructure
        }
      </>,
    );
    expect(
      screen.getByText('clusters.overview.dual-stack-disabled'),
    ).toBeInTheDocument();
  });

  it('omits the dual stack IP field when networkDetails is absent', () => {
    expect(keys(getGroups({ provider: 'gcp' }).infrastructure)).toEqual([
      'provider',
    ]);
  });

  it('prefers the Kyma resource labels for the account IDs', () => {
    render(
      <>
        {
          getGroups(fullInfo, {
            kymaResourceLabels: {
              'kyma-project.io/global-account-id': 'ga-from-label',
              'kyma-project.io/subaccount-id': 'sa-from-label',
            },
          }).btpAccount
        }
      </>,
    );

    expect(screen.getByText('ga-from-label')).toBeInTheDocument();
    expect(screen.getByText('sa-from-label')).toBeInTheDocument();
    expect(screen.queryByText('ga-from-cm')).not.toBeInTheDocument();
    expect(screen.queryByText('sa-from-cm')).not.toBeInTheDocument();
  });

  it('shows the account IDs from the labels when clusterInfo has none', () => {
    const groups = getGroups(
      {},
      {
        kymaResourceLabels: {
          'kyma-project.io/global-account-id': 'ga-from-label',
        },
      },
    );

    expect(keys(groups.btpAccount)).toEqual(['global-account-id']);
  });
});
