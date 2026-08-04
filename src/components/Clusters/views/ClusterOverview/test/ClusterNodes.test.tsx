import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { ClusterNodes } from '../ClusterNodes';

const capturedProps: Record<string, any> = {};

vi.mock('shared/components/GenericList/GenericList', () => ({
  GenericList: (props: any) => {
    Object.assign(capturedProps, props);
    return (
      <div data-testid="generic-list">
        {props.rowRenderer(props.entries[0])}
      </div>
    );
  },
}));

vi.mock('shared/components/EventsList', () => ({
  EventsList: () => <div data-testid="events-list" />,
}));

const nodes = [
  {
    metadata: {
      name: 'shoot--node-1',
      creationTimestamp: '2026-01-01T00:00:00Z',
    },
    status: { conditions: [{ status: 'True', type: 'Ready' }] },
  },
];

const renderList = () => {
  const router = createMemoryRouter(
    [
      {
        path: '/cluster/:cluster/overview',
        element: <ClusterNodes data={nodes} />,
      },
    ],
    { initialEntries: ['/cluster/my-cluster/overview'] },
  );

  return render(
    <Provider>
      <RouterProvider router={router} />
    </Provider>,
  );
};

describe('ClusterNodes navigation', () => {
  it('links a node name to the node route without a layout param', () => {
    const { container } = renderList();

    const link = container.querySelector(
      '[data-testid="node-details-link-shoot--node-1"]',
    );
    expect(link).toHaveAttribute(
      'href',
      '/cluster/my-cluster/overview/nodes/shoot--node-1',
    );
    // a `layout` param is what splits the screen into columns
    expect(link?.getAttribute('href')).not.toContain('layout');
  });

  it('sends a click anywhere on the row to the same node route', () => {
    renderList();

    expect(capturedProps.hasDetailsView).toBe(true);
    expect(capturedProps.customUrl(nodes[0])).toBe(
      '/cluster/my-cluster/overview/nodes/shoot--node-1',
    );
  });

  it('encodes node names that need escaping', () => {
    renderList();

    expect(
      capturedProps.customUrl({ metadata: { name: 'node/with space' } }),
    ).toBe('/cluster/my-cluster/overview/nodes/node%2Fwith%20space');
  });
});
