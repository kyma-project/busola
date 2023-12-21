import React from 'react';
import { act, render, waitFor } from 'testing/reactTestingUtils';

import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { ThemeProvider } from '@ui5/webcomponents-react';

const breadcrumbs = [
  { name: 'test-1', url: '/' },
  { name: 'test-2', url: '/test' },
];

describe('ResourceNotFound', () => {
  it('Renders resource type and breadcrumb', async () => {
    const { queryByText } = render(
      <ThemeProvider>
        <ResourceNotFound resource="Resource" breadcrumbs={breadcrumbs} />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(
          queryByText('components.resource-not-found.messages.not-found'),
        ).toBeInTheDocument();

        expect(queryByText(breadcrumbs[0].name)).toBeInTheDocument();
        expect(queryByText(breadcrumbs[1].name)).toBeInTheDocument();
      });
    });
  });

  it('Renders custom message', async () => {
    const message = 'Error';

    const { queryByText } = render(
      <ThemeProvider>
        <ResourceNotFound
          resource="Resource"
          breadcrumbs={breadcrumbs}
          customMessage={message}
        />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(queryByText(message)).toBeInTheDocument();
      });
    });
  });
});
