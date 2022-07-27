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

  it('Renders empty owners for empty data', () => {
    const owners = null;

    const component = shallow(<ControlledBy value={owners} />);
    const cb = component.find(CB);
    expect(cb).toHaveLength(0);
  });
});

describe('ControlledBy with kindOnly', () => {
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

    const component = shallow(
      <ControlledBy structure={{ kindOnly: true }} value={owners} />,
    );
    const cbk = component.find(CB);
    const { ownerReferences, kindOnly } = component.props();
    expect(cbk).toHaveLength(1);
    expect(ownerReferences).toHaveLength(2);
    expect(kindOnly).toBe(true);
  });

  it('Renders empty owners for empty data', () => {
    const owners = null;

    const component = shallow(
      <ControlledBy structure={{ kindOnly: true }} kindOnly value={owners} />,
    );
    const cbk = component.find(CB);
    expect(cbk).toHaveLength(0);
  });
});
