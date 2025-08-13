import { allExtensionsState } from 'state/navigation/extensionsAtom';
import { render } from '@testing-library/react';
import { useGetCRbyPath } from '../useGetCRbyPath.js';
import { RecoilRoot } from 'recoil';
import { Provider as JotaiProvider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';

let mockNamespaceId = 'namespaceId';
let mockCrds = [];

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useParams: () => ({
    namespaceId: mockNamespaceId,
  }),
}));

vi.mock('@ui5/webcomponents-react', () => {
  return {
    Link: () => ({}),
  };
});

vi.mock('shared/components/Dropdown/Dropdown', () => {
  return {
    default: () => ({}),
  };
});

// Component to initialize Jotai atoms with test data
const JotaiHydrator = ({ children, initialValues }) => {
  useHydrateAtoms(initialValues);
  return children;
};

const TestComponent = () => {
  const value = useGetCRbyPath();

  return <p data-testid="value">{JSON.stringify(value)}</p>;
};

const renderWithProviders = mockCrds => {
  return render(
    <RecoilRoot>
      <JotaiProvider>
        <JotaiHydrator initialValues={[[allExtensionsState, mockCrds]]}>
          <TestComponent />
        </JotaiHydrator>
      </JotaiProvider>
    </RecoilRoot>,
  );
};

describe('useGetCRbyPath', () => {
  it('Returns nothing for an empty list', () => {
    const { queryByTestId } = renderWithProviders(mockCrds);

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

    const { queryByTestId } = renderWithProviders(mockCrds);
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

    const { queryByTestId } = renderWithProviders(mockCrds);

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

    const { queryByTestId } = renderWithProviders(mockCrds);
    expect(queryByTestId('value')).toHaveTextContent(
      JSON.stringify(mockCrds[1]),
    );
  });
});
