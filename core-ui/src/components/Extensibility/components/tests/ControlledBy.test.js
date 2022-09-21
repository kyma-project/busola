import React from 'react';
import { shallow } from 'enzyme';
import { ControlledBy } from '../ControlledBy';
import { ControlledBy as CB } from 'shared/components/ControlledBy/ControlledBy';

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

    const component = shallow(<ControlledBy value={owners} />);
    const cb = component.find(CB);
    const { ownerReferences, kindOnly } = component.props();
    expect(cb).toHaveLength(1);
    expect(ownerReferences).toHaveLength(2);
    expect(kindOnly).toBeFalsy();
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

  const component = shallow(
    <ControlledBy structure={{ kindOnly: true }} value={owners} />,
  );
  const cb = component.find(CB);
  const { ownerReferences, kindOnly } = component.props();
  expect(cb).toHaveLength(1);
  expect(ownerReferences).toHaveLength(2);
  expect(kindOnly).toBe(true);
});
