import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { ColumnWrapper } from '../overview.routes';

vi.mock('components/Clusters/views/ClusterOverview/ClusterOverview', () => ({
  ClusterOverview: () => <div data-testid="cluster-overview" />,
}));

vi.mock('components/Nodes/NodeDetails/NodeDetails', () => ({
  default: ({ nodeName, layoutNumber }: any) => (
    <div data-testid="node-details" data-layout-number={layoutNumber}>
      {nodeName}
    </div>
  ),
}));

const renderAt = async (path: string) => {
  const store = createStore();
  const router = createMemoryRouter(
    [
      { path: '/cluster/:cluster/overview', element: <ColumnWrapper /> },
      {
        path: '/cluster/:cluster/overview/nodes/:nodeName',
        element: <ColumnWrapper />,
      },
    ],
    { initialEntries: [path] },
  );

  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  // let the lazy NodeDetails chunk resolve
  await screen.findByTestId(/cluster-overview|node-details/);

  return store;
};

describe('Cluster Overview node navigation layout', () => {
  it('renders the overview alone in a single column', async () => {
    const store = await renderAt('/cluster/my-cluster/overview');

    expect(screen.getByTestId('cluster-overview')).toBeInTheDocument();
    expect(screen.queryByTestId('node-details')).not.toBeInTheDocument();

    const layoutState = store.get(columnLayoutAtom);
    expect(layoutState.layout).toBe('OneColumn');
    expect(layoutState.startColumn).toMatchObject({ resourceType: 'Cluster' });
    expect(layoutState.midColumn).toBeNull();
  });

  it('replaces the overview with node details in a single start column', async () => {
    const store = await renderAt(
      '/cluster/my-cluster/overview/nodes/shoot--node-1',
    );

    const nodeDetails = screen.getByTestId('node-details');
    expect(nodeDetails).toHaveTextContent('shoot--node-1');
    expect(screen.queryByTestId('cluster-overview')).not.toBeInTheDocument();
    // startColumn means no fullscreen/close buttons
    expect(nodeDetails).toHaveAttribute('data-layout-number', 'startColumn');

    const layoutState = store.get(columnLayoutAtom);
    expect(layoutState.layout).toBe('OneColumn');
    expect(layoutState.startColumn).toMatchObject({
      resourceName: 'shoot--node-1',
      resourceType: 'Nodes',
    });
    expect(layoutState.midColumn).toBeNull();
    expect(layoutState.endColumn).toBeNull();
  });
});
