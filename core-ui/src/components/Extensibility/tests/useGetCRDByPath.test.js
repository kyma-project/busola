import React from 'react';
import { render } from '@testing-library/react';
import { useGetCRbyPath } from '../useGetCRbyPath.js';

let mockNamespaceId = 'namespaceId';
let mockCrds = [];

jest.mock('shared/contexts/MicrofrontendContext', () => ({
  useMicrofrontendContext: () => ({
    namespaceId: mockNamespaceId,
    customResources: mockCrds,
  }),
}));

function TestComponent() {
  const value = useGetCRbyPath();
  return <p data-testid="value">{JSON.stringify(value)}</p>;
}

describe('useGetCRbyPath', () => {
  it('Returns nothing for an empty list', () => {
    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('');
  });

  it('Returns first namespacematching crd', () => {
    delete window.location;
    window.location = {
      pathname: `/namespaces/${mockNamespaceId}/path2`,
    };

    mockCrds = [
      {
        resource: {
          path: 'path1',
          scope: 'namespace',
        },
      },
      {
        resource: {
          path: 'path2',
          scope: 'namespace',
        },
      },
    ];

    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });

  it("Doesn't return the crd that name matches the namespace (bug)", () => {
    mockNamespaceId = 'path1';
    delete window.location;
    window.location = {
      pathname: `/namespaces/${mockNamespaceId}/path2`,
    };

    mockCrds = [
      {
        resource: {
          path: 'path1',
          scope: 'namespace',
        },
      },
      {
        resource: {
          path: 'path2',
          scope: 'namespace',
        },
      },
    ];

    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });

  it('Returns matchin cluster crd', () => {
    mockNamespaceId = undefined;
    delete window.location;
    window.location = {
      pathname: `/path2`,
    };

    mockCrds = [
      {
        resource: {
          path: 'path1',
          scope: 'namespace',
        },
      },
      {
        resource: {
          path: 'path2',
        },
      },
    ];

    const { queryByTestId } = render(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });
});
