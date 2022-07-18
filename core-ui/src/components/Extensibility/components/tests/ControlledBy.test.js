import React from 'react';
import { shallow } from 'enzyme';
import { ControlledBy, ControlledByKind } from '../ControlledBy';
import {
  ControlledBy as CB,
  ControlledByKind as CBK,
} from 'shared/components/ControlledBy/ControlledBy';

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
    const { ownerReferences } = component.props();
    expect(cb).toHaveLength(1);
    expect(ownerReferences).toHaveLength(2);
  });

  it('Renders empty owners for empty data', () => {
    const owners = null;

    const component = shallow(<ControlledBy value={owners} />);
    const cb = component.find(CB);
    expect(cb).toHaveLength(0);
  });
});

describe('ControlledByKind', () => {
  it('Renders ControlledByKind component', () => {
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

    const component = shallow(<ControlledByKind value={owners} />);
    const cbk = component.find(CBK);
    const { ownerReferences } = component.props();
    expect(cbk).toHaveLength(1);
    expect(ownerReferences).toHaveLength(2);
  });

  it('Renders empty owners for empty data', () => {
    const owners = null;

    const component = shallow(<ControlledByKind value={owners} />);
    const cbk = component.find(CBK);
    expect(cbk).toHaveLength(0);
  });
});
