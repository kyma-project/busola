import { render } from 'testing/reactTestingUtils';
import { mount } from 'testing/enzymeUtils';
import { ControlledBy, GoToDetailsLink } from '../ControlledBy';

describe('ControlledBy', () => {
  it('Renders placeholders for no owners', () => {
    const withDefaultPlaceholder = render(<ControlledBy />);
    expect(withDefaultPlaceholder.queryByText('-')).toBeInTheDocument();

    const withCustomPlaceholder = render(<ControlledBy placeholder=":(" />);
    expect(withCustomPlaceholder.queryByText(':(')).toBeInTheDocument();
  });

  it('Renders owners - single', () => {
    const { queryByText } = render(
      <ControlledBy ownerReferences={{ kind: 'ResourceKind1' }} />,
    );
    expect(queryByText('ResourceKind1')).toBeInTheDocument();
  });

  it('Renders owners - array', () => {
    const { queryByText } = render(
      <ControlledBy
        ownerReferences={[{ kind: 'ResourceKind1' }, { kind: 'ResourceKind2' }]}
      />,
    );
    expect(queryByText('ResourceKind1')).toBeInTheDocument();
    expect(queryByText('ResourceKind2')).toBeInTheDocument();
  });

  it('Renders owners - with kind', () => {
    const component = mount(
      <ControlledBy
        ownerReferences={[
          {
            kind: 'ResourceKind',
            name: 'ResourceName',
            apiVersion: 'ApiVersion',
          },
        ]}
      />,
    );

    const detailsLink = component.find(GoToDetailsLink);
    expect(detailsLink).toHaveLength(1);
    expect(detailsLink.props().apiVersion).toBe('ApiVersion');
    expect(detailsLink.props().name).toBe('ResourceName');
    expect(detailsLink.props().resource).toBe('resourcekinds');
  });

  it('Renders owners - without kind', () => {
    const component = mount(
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

    const detailsLink = component.find(GoToDetailsLink);
    expect(detailsLink).toHaveLength(0);
  });
});
