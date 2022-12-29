import React from 'react';
import { extensionsState } from 'state/navigation/extensionsAtom';
import { render } from 'testing/reactTestingUtils';
import { useGetCRbyPath } from '../useGetCRbyPath.js';

let mockNamespaceId = 'namespaceId';
let mockCrds = [];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    namespaceId: mockNamespaceId,
  }),
}));

function TestComponent() {
  const value = useGetCRbyPath();
  return <p data-testid="value">{JSON.stringify(value)}</p>;
}

describe('useGetCRbyPath', () => {
  it('Returns nothing for an empty list', () => {
    const { queryByTestId } = render(<TestComponent />, {
      initializeState: snapshot => snapshot.set(extensionsState, []),
    });

    expect(queryByTestId('value')).toHaveTextContent('');
  });

  it('Returns first namespacematching crd', () => {
    delete window.location;
    window.location = {
      pathname: `namespaces/${mockNamespaceId}/path2`,
    };

    mockCrds = [
      {
        general: {
          urlPath: 'path1',
          scope: 'namespace',
        },
      },
      {
        general: {
          urlPath: 'path2',
          scope: 'namespace',
        },
      },
    ];

    const { queryByTestId } = render(<TestComponent />, {
      initializeState: snapshot => {
        snapshot.set(extensionsState, mockCrds);
      },
    });
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });

  it("Doesn't return the crd that name matches the namespace (bug)", () => {
    mockNamespaceId = 'path1';
    delete window.location;
    window.location = {
      pathname: `namespaces/${mockNamespaceId}/path2`,
    };

    mockCrds = [
      {
        general: {
          urlPath: 'path1',
          scope: 'namespace',
        },
      },
      {
        general: {
          urlPath: 'path2',
          scope: 'namespace',
        },
      },
    ];

    const { queryByTestId } = render(<TestComponent />, {
      initializeState: snapshot => {
        snapshot.set(extensionsState, mockCrds);
      },
    });
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });

  it('Returns matchin cluster crd', () => {
    mockNamespaceId = undefined;
    delete window.location;
    window.location = {
      pathname: `path2`,
    };

    mockCrds = [
      {
        general: {
          urlPath: 'path1',
          scope: 'namespace',
        },
      },
      {
        general: {
          urlPath: 'path2',
        },
      },
    ];

    const { queryByTestId } = render(<TestComponent />, {
      initializeState: snapshot => {
        snapshot.set(extensionsState, mockCrds);
      },
    });
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });
});
