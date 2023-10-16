import React from 'react';
import { render } from '@testing-library/react';
import PodRestarts from '../PodRestarts';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('PodRestarts', () => {
  it('Shows 0 for no statuses', () => {
    const { queryByRole } = render(
      <ThemeProvider>
        <PodRestarts statuses={[]} />
      </ThemeProvider>,
    );
    expect(queryByRole('status')).toHaveTextContent('0');
  });

  it('Sums up restart statuses', () => {
    const statuses = [
      { name: 'container-1', restartCount: 10 },
      { name: 'container-2', restartCount: 3 },
    ];

    const { queryByRole } = render(
      <ThemeProvider>
        <PodRestarts statuses={statuses} />
      </ThemeProvider>,
    );
    expect(queryByRole('status')).toHaveTextContent('13');
  });
});
