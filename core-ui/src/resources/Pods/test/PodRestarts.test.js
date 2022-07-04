import React from 'react';
import { render } from '@testing-library/react';
import PodRestarts from '../PodRestarts';

describe('PodRestarts', () => {
  it('Shows 0 for no statuses', () => {
    const { queryByRole } = render(<PodRestarts statuses={[]} />);
    expect(queryByRole('status')).toHaveTextContent('0');
  });

  it('Sums up restart statuses', () => {
    const statuses = [
      { name: 'container-1', restartCount: 10 },
      { name: 'container-2', restartCount: 3 },
    ];

    const { queryByRole } = render(<PodRestarts statuses={statuses} />);
    expect(queryByRole('status')).toHaveTextContent('13');
  });
});
