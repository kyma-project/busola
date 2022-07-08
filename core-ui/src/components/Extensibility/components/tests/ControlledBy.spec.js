import React from 'react';
import { shallow } from 'enzyme';
import { render } from '@testing-library/react';
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
    expect(cb).toHaveLength(1);
  });

  it('Renders empty owners for incorrect data', () => {
    const owners = '';

    const { getByText } = render(<ControlledBy value={owners} />);
    expect(getByText(new RegExp('-', 'i'))).toBeVisible();
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
    expect(cbk).toHaveLength(1);
  });

  it('Renders empty owners for incorrect data', () => {
    const owners = '';

    const { getByText } = render(<ControlledByKind value={owners} />);
    expect(getByText(new RegExp('-', 'i'))).toBeVisible();
  });
});
