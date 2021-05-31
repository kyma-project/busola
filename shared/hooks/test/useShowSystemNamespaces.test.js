import React from 'react';
import { render } from '@testing-library/react';
import { useShowHiddenNamespaces } from '../useShowHiddenNamespaces.js';

let mockToggles = [];
jest.mock('@luigi-project/client', () => ({
  getActiveFeatureToggles: () => mockToggles,
}));

function TestComponent() {
  const showHiddenNamespaces = useShowHiddenNamespaces();
  return <p data-testid="value">{showHiddenNamespaces.toString()}</p>;
}

describe('useShowHiddenNamespaces', () => {
  it('Changes returned value during re-renders', () => {
    const { queryByTestId, rerender } = render(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('false');

    mockToggles = ['showHiddenNamespaces'];

    rerender(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('true');

    mockToggles = ['anotherFeature'];

    rerender(<TestComponent />);
    expect(queryByTestId('value')).toHaveTextContent('false');
  });
});
