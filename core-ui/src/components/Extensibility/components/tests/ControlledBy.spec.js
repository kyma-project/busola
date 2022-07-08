import React from 'react';
import { render } from '@testing-library/react';
import { ControlledBy, ControlledByKind } from '../ControlledBy';

describe('ControlledBy', () => {
  it('Renders owners', () => {
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

    const { getByText } = render(<ControlledBy value={owners} />);
    expect(getByText(new RegExp('Pod', 'i'))).toBeVisible();
    expect(getByText(new RegExp('Function', 'i'))).toBeVisible();
  });
});

describe('ControlledByKind', () => {
  it('Renders owners', () => {
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

    const { getByText } = render(<ControlledByKind value={owners} />);
    expect(getByText(new RegExp('Pod', 'i'))).toBeVisible();
    expect(getByText(new RegExp('Function', 'i'))).toBeVisible();
  });
});
