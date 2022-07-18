import React from 'react';
import { render } from '@testing-library/react';
import { JoinedArray } from '../JoinedArray';

describe('JoinedArray', () => {
  it('Renders joined array', () => {
    const value = ['a', 'b', 'c'];

    const { getByText } = render(<JoinedArray value={value} />);
    expect(getByText(new RegExp('a, b, c', 'i'))).toBeVisible();
  });

  it('Renders joined array with a custom separator', () => {
    const value = ['a', 'b', 'c'];
    const structure = { separator: '.' };

    const { getByText } = render(
      <JoinedArray value={value} structure={structure} />,
    );
    expect(getByText(new RegExp('a.b.c', 'i'))).toBeVisible();
  });

  it('Renders placeholder for empty array', () => {
    const value = [];

    const { getByText } = render(<JoinedArray value={value} />);
    expect(getByText(new RegExp('-', 'i'))).toBeVisible();
  });

  it('Renders placeholder for null', () => {
    const value = null;

    const { getByText } = render(<JoinedArray value={value} />);
    expect(getByText(new RegExp('-', 'i'))).toBeVisible();
  });
});
