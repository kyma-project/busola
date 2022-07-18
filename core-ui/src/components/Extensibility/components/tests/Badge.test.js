import React from 'react';
import { render } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('Renders a badge with positive class for running status', () => {
    const value = 'Running';
    const { container } = render(<Badge value={value} />);
    expect(
      container.getElementsByClassName('fd-object-status--positive').length,
    ).toBe(1);
  });

  it('Renders a badge with informative class for pending status', () => {
    const value = 'Pending';
    const { container } = render(<Badge value={value} />);
    expect(
      container.getElementsByClassName('fd-object-status--informative').length,
    ).toBe(1);
  });

  it('Renders a badge with negative class for failed status', () => {
    const value = 'Failed';
    const { container } = render(<Badge value={value} />);
    expect(
      container.getElementsByClassName('fd-object-status--negative').length,
    ).toBe(1);
  });

  it('Renders a badge with critical class for unknown status', () => {
    const value = 'Unknown';
    const { container } = render(<Badge value={value} />);
    expect(
      container.getElementsByClassName('fd-object-status--critical').length,
    ).toBe(1);
  });

  it('Renders a badge without additional class for custom status', () => {
    const value = 'Custom';
    const { container } = render(<Badge value={value} />);
    expect(
      container.getElementsByClassName('fd-object-status--positive').length,
    ).toBe(0);
    expect(
      container.getElementsByClassName('fd-object-status--informative').length,
    ).toBe(0);
    expect(
      container.getElementsByClassName('fd-object-status--negative').length,
    ).toBe(0);
    expect(
      container.getElementsByClassName('fd-object-status--critical').length,
    ).toBe(0);
  });
});
