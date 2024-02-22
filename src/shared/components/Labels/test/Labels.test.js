import React from 'react';
import { Labels } from 'shared/components/Labels/Labels';
import { render } from '@testing-library/react';

describe('Labels', () => {
  it('Labels should render with labels', () => {
    const { container } = render(
      <Labels labels={{ testLabel: 'testValue' }} />,
    );

    expect(
      container.querySelector("[text='testLabel=testValue']"),
    ).toBeInTheDocument();
  });
});
