import { render } from 'testing/reactTestingUtils';
import { ControlledBy } from '../ControlledBy';

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

describe('ControlledBy', () => {
  it('Renders placeholders for no owners', () => {
    const withDefaultPlaceholder = render(<ControlledBy />);
    expect(withDefaultPlaceholder.queryByText('-')).toBeInTheDocument();

    const withCustomPlaceholder = render(<ControlledBy placeholder=":(" />);
    expect(withCustomPlaceholder.queryByText(':(')).toBeInTheDocument();
  });

  it('Renders owners - single', () => {
    const { queryByText } = render(
      <ControlledBy
        ownerReferences={{ kind: 'ResourceKind1', name: 'ResourceName1' }}
      />,
    );

    expect(queryByText(/ResourceKind1/)).toBeInTheDocument();
    expect(queryByText(/ResourceName1/)).toBeInTheDocument();
  });

  it('Renders owners - array', () => {
    const { queryByText } = render(
      <ControlledBy
        ownerReferences={[
          { kind: 'ResourceKind1', name: 'ResourceName1' },
          { kind: 'ResourceKind2', name: 'ResourceName2' },
        ]}
      />,
    );
    expect(queryByText(/ResourceKind1/)).toBeInTheDocument();
    expect(queryByText(/ResourceName1/)).toBeInTheDocument();

    expect(queryByText(/ResourceKind2/)).toBeInTheDocument();
    expect(queryByText(/ResourceName2/)).toBeInTheDocument();
  });

  it('Renders owners - with name', () => {
    const ownerReferences = {
      kind: 'ClusterRole',
      name: 'ResourceName',
      apiVersion: 'ApiVersion',
    };

    const { queryByText } = render(
      <ControlledBy ownerReferences={ownerReferences} />,
    );

    expect(queryByText(/ResourceName/)).toBeInTheDocument();
  });

  it('Renders owners - without name', () => {
    const { queryByText } = render(
      <ControlledBy
        ownerReferences={[
          {
            kind: 'ResourceKind',
            name: 'ResourceName',
            apiVersion: 'ApiVersion',
          },
        ]}
        kindOnly
      />,
    );

    expect(queryByText(/ResourceName/)).not.toBeInTheDocument();
  });
});
