import { ControlledBy } from '../ControlledBy';
import { ControlledBy as CB } from 'shared/components/ControlledBy/ControlledBy';
import { render } from 'testing/reactTestingUtils';

vi.mock('shared/components/ControlledBy/ControlledBy', async () => {
  const CBMock = (
    await vi.importActual('shared/components/ControlledBy/ControlledBy')
  ).ControlledBy;
  return {
    ControlledBy: vi.fn(props => <CBMock {...props} />),
  };
});

describe('ControlledBy', () => {
  it('Renders ControlledBy component', () => {
    const owners = [
      {
        apiVersion: 'v1',
        kind: 'Pod',
        name: 'pod-name',
      },
      {
        apiVersion: 'v1',
        kind: 'Function',
        name: 'function-name',
      },
    ];

    const { container } = render(<ControlledBy value={owners} />);

    expect(CB).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerReferences: owners,
        kindOnly: undefined,
      }),
      {},
    );

    const cb = container.getElementsByClassName('controlled-by-list');
    expect(cb).toHaveLength(1);
  });
});

it('Renders ControlledBy with kindOnly component', () => {
  const owners = [
    {
      apiVersion: 'v1',
      kind: 'Pod',
      name: 'pod-name',
    },
    {
      apiVersion: 'v1',
      kind: 'Function',
      name: 'function-name',
    },
  ];

  const { container } = render(
    <ControlledBy structure={{ kindOnly: true }} value={owners} />,
  );

  expect(CB).toHaveBeenCalledWith(
    expect.objectContaining({
      ownerReferences: owners,
      kindOnly: true,
    }),
    {},
  );

  const cb = container.getElementsByClassName('controlled-by-list');
  expect(cb).toHaveLength(1);
});
