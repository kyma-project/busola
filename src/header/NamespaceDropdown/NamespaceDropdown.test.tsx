import { render } from 'testing/reactTestingUtils';
import { namespacesState } from 'state/namespacesAtom';
import { NamespaceDropdown } from './NamespaceDropdown';
import { MutableSnapshot } from 'recoil';

const mockPathname = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    get pathname() {
      return mockPathname();
    },
  },
});

const CLUSTER_PREFIX = '/cluster/clusterName';

const INITIAL_STATE = {
  initializeState: (snapshot: MutableSnapshot) =>
    snapshot.set(namespacesState, ['test', 'test2']),
};

describe('NamespaceDropdown test', () => {
  it('Should navigate to Namespaces list', async () => {
    mockPathname.mockReturnValue(`${CLUSTER_PREFIX}/overview`);

    const { findByText } = render(
      <NamespaceDropdown hideDropdown={() => {}} />,
      INITIAL_STATE,
    );
    const namespaceListItem = await findByText(
      'namespaces.namespaces-overview',
    );
    const hrefAttribute = namespaceListItem.getAttribute('href');

    expect(hrefAttribute).toEqual(`${CLUSTER_PREFIX}/namespaces`);
  });

  it('Should navigate to Namespace overview when being on Cluster overview', async () => {
    mockPathname.mockReturnValue(`${CLUSTER_PREFIX}/overview`);

    const { findByText } = render(
      <NamespaceDropdown hideDropdown={() => {}} />,
      INITIAL_STATE,
    );
    const namespaceListItem = await findByText('test2');
    const hrefAttribute = namespaceListItem.getAttribute('href');

    expect(hrefAttribute).toEqual(`${CLUSTER_PREFIX}/namespaces/test2`);
  });

  it('Should navigate to deployments list but on different Namespace', async () => {
    mockPathname.mockReturnValue(
      `${CLUSTER_PREFIX}/namespaces/test/deployments`,
    );

    const { findByText } = render(
      <NamespaceDropdown hideDropdown={() => {}} />,
      INITIAL_STATE,
    );
    const namespaceListItem = await findByText('test2');
    const hrefAttribute = namespaceListItem.getAttribute('href');

    expect(hrefAttribute).toEqual(
      `${CLUSTER_PREFIX}/namespaces/test2/deployments`,
    );
  });

  it('Should switch context from Deployment details to Deployment list on different Namespace', async () => {
    mockPathname.mockReturnValue(
      `${CLUSTER_PREFIX}/namespaces/test/deployments/httpbin`,
    );

    const { findByText } = render(
      <NamespaceDropdown hideDropdown={() => {}} />,
      INITIAL_STATE,
    );
    const namespaceListItem = await findByText('test2');
    const hrefAttribute = namespaceListItem.getAttribute('href');

    expect(hrefAttribute).toEqual(
      `${CLUSTER_PREFIX}/namespaces/test2/deployments`,
    );
  });
});
