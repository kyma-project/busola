import { describe, it, expect, vi } from 'vitest';
import { isValidElement, ReactElement } from 'react';
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
  globalAccountID: 'ga-from-cm',
  subaccountID: 'sa-from-cm',
  natGatewayIps: ['1.2.3.4'],
};

function getFields(
  clusterInfo: ClusterInfo,
  { loading = false, kymaResourceLabels = {} } = {},
) {
  mockUseGetClusterInfo.mockReturnValue({ clusterInfo, loading });
  const { result } = renderHook(() => useClusterInfoFields(kymaResourceLabels));
  return result.current.filter(isValidElement) as ReactElement[];
}

const keys = (fields: ReactElement[]) => fields.map((field) => field.key);

describe('useClusterInfoFields', () => {
  it('returns no fields while loading', () => {
    expect(getFields(fullInfo, { loading: true })).toEqual([]);
  });

  it('returns every field in display order', () => {
    expect(keys(getFields(fullInfo))).toEqual([
      'provider',
      'region',
      'seed-region',
      'global-account-id',
      'subaccount-id',
      'nat-gateway-ips',
    ]);
  });

  it('returns only the fields clusterInfo has', () => {
    expect(
      keys(getFields({ region: 'europe-west3', natGatewayIps: ['1.2.3.4'] })),
    ).toEqual(['region', 'nat-gateway-ips']);
    expect(getFields({})).toEqual([]);
  });

  it('prefers the Kyma resource labels for the account IDs', () => {
    render(
      <>
        {getFields(fullInfo, {
          kymaResourceLabels: {
            'kyma-project.io/global-account-id': 'ga-from-label',
            'kyma-project.io/subaccount-id': 'sa-from-label',
          },
        })}
      </>,
    );

    expect(screen.getByText('ga-from-label')).toBeInTheDocument();
    expect(screen.getByText('sa-from-label')).toBeInTheDocument();
    expect(screen.queryByText('ga-from-cm')).not.toBeInTheDocument();
    expect(screen.queryByText('sa-from-cm')).not.toBeInTheDocument();
  });

  it('shows the account IDs from the labels when clusterInfo has none', () => {
    const fields = getFields(
      {},
      {
        kymaResourceLabels: {
          'kyma-project.io/global-account-id': 'ga-from-label',
        },
      },
    );

    expect(keys(fields)).toEqual(['global-account-id']);
  });
});
