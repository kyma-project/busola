import { render } from 'testing/reactTestingUtils';
import { ResourceLink } from '../ResourceLink';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useMatch: () => {
    return {
      params: {
        cluster: 'test-cluster',
      },
    };
  },
}));

describe('ResourceLink', () => {
  const value = 'link-to-resource';
  const originalResource = {
    name: 'original-resource-name',
    namespace: 'original-resource-namespace',
    kind: 'original-resource.kind',
  };

  it('Renders placeholder for no value', async () => {
    const { findByText } = render(
      <ResourceLink structure={{ placeholder: 'empty!' }} />,
    );
    expect(await findByText('extensibility::empty!'));
  });

  it('Fires an event on click', () => {
    const res = {
      name: '$root.name',
      kind: '$root.kind',
      namespace: '$root.namespace',
    };
    const { getByText } = render(
      <ResourceLink
        value={value}
        structure={{
          source: '$root.name',
          resource: res,
        }}
        originalResource={originalResource}
      />,
    );

    const anchorElement = getByText(`extensibility::${value}`);
    const hrefAttribute = anchorElement.getAttribute('href');
    expect(hrefAttribute).toBe(
      '/cluster/test-cluster/namespaces/original-resource-namespace/original-resource.kinds/original-resource-name',
    );
  });

  it('Accepts config without namespace', () => {
    const { getByText } = render(
      <ResourceLink
        value={value}
        structure={{
          source: '$root.name',
          resource: {
            name: '$root.name',
            kind: '$root.kind',
          },
        }}
        originalResource={originalResource}
      />,
    );

    // no errors here
    expect(getByText(`extensibility::${value}`)).toBeInTheDocument();
  });

  it('Show error on invalid config', () => {
    const { queryByText } = render(
      <ResourceLink
        value={value}
        structure={{ resource: { namespace: '$notExistingMethod()' } }}
        originalResource={originalResource}
      />,
    );

    expect(
      queryByText('extensibility.configuration-error'),
    ).toBeInTheDocument();
  });
});
