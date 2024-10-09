import { allExtensionsState } from 'state/navigation/extensionsAtom';
import { render } from '@testing-library/react';
import { useGetCRbyPath } from '../useGetCRbyPath.js';
import { RecoilRoot } from 'recoil';

let mockNamespaceId = 'namespaceId';
let mockCrds = [];

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: () => ({
    namespaceId: mockNamespaceId,
  }),
}));

const TestComponent = () => {
  const value = useGetCRbyPath();
  console.log(value);
  return <p data-testid="value">{JSON.stringify(value)}</p>;
};

describe('useGetCRbyPath', () => {
  it('Returns nothing for an empty list', () => {
    const { queryByTestId } = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(allExtensionsState, mockCrds)}
      >
        <TestComponent />
      </RecoilRoot>,
    );

    expect(queryByTestId('value')).toHaveTextContent('');
  });

  it('Returns first namespace matching crd', () => {
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

    const { queryByTestId } = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(allExtensionsState, mockCrds)}
      >
        <TestComponent />
      </RecoilRoot>,
    );
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

    const { queryByTestId } = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(allExtensionsState, mockCrds)}
      >
        <TestComponent />
      </RecoilRoot>,
    );

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

    const { queryByTestId } = render(
      <RecoilRoot
        initializeState={snapshot => snapshot.set(allExtensionsState, mockCrds)}
      >
        <TestComponent />
      </RecoilRoot>,
    );
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });
});
