import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ClusterWorkerPoolsCard from './ClusterWorkerPoolsCard';
import { ClusterInfo } from './useGetClusterInfo';

const mockUseGetClusterInfo = vi.fn();

vi.mock('./useGetClusterInfo', () => ({
  useGetClusterInfo: () => mockUseGetClusterInfo(),
}));

function renderCard(clusterInfo: ClusterInfo, { loading = false } = {}) {
  mockUseGetClusterInfo.mockReturnValue({ clusterInfo, loading });
  return render(<ClusterWorkerPoolsCard />);
}

describe('ClusterWorkerPoolsCard', () => {
  it('renders nothing when there are no worker pools', () => {
    const { container } = renderCard({});
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when workerPools is an empty object', () => {
    const { container } = renderCard({ workerPools: {} });
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing while loading', () => {
    const { container } = renderCard(
      { workerPools: { 'cpu-worker-0': { name: 'cpu-worker-0' } } },
      { loading: true },
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a row per worker pool with its details', () => {
    renderCard({
      workerPools: {
        'cpu-worker-0': {
          name: 'cpu-worker-0',
          machineType: 'Standard_D2s_v5',
          autoScalerMin: 3,
          autoScalerMax: 20,
          haZones: true,
        },
      },
    });

    expect(screen.getByText('cpu-worker-0')).toBeInTheDocument();
    expect(screen.getByText('Standard_D2s_v5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows HA Zones as Yes when the pool is spread across zones', () => {
    renderCard({
      workerPools: { 'cpu-worker-0': { name: 'cpu-worker-0', haZones: true } },
    });
    expect(screen.getByText('common.labels.yes')).toBeInTheDocument();
  });

  it('shows HA Zones as No when the pool is not spread across zones', () => {
    renderCard({
      workerPools: { 'cpu-worker-0': { name: 'cpu-worker-0', haZones: false } },
    });
    expect(screen.getByText('common.labels.no')).toBeInTheDocument();
  });

  it('shows the pool count in the card title', () => {
    const { container } = renderCard({
      workerPools: {
        'cpu-worker-0': { name: 'cpu-worker-0' },
        'cpu-worker-1': { name: 'cpu-worker-1' },
      },
    });
    expect(
      container.querySelector('ui5-card-header')?.getAttribute('title-text'),
    ).toBe('clusters.overview.worker-pools.title (2)');
  });
});
