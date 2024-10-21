import { render } from 'testing/reactTestingUtils';
import { ResourceLink } from '../ResourceLink';

vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
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
