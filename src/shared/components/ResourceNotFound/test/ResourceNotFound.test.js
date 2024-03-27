import { act, render, waitFor } from 'testing/reactTestingUtils';

import { ResourceNotFound } from 'shared/components/ResourceNotFound/ResourceNotFound';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('ResourceNotFound', () => {
  it('Renders resource type', async () => {
    const { queryByText } = render(
      <ThemeProvider>
        <ResourceNotFound resource="Resource" />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(
          queryByText('components.resource-not-found.messages.not-found'),
        ).toBeInTheDocument();
      });
    });
  });

  it('Renders custom message', async () => {
    const message = 'Error';

    const { queryByText } = render(
      <ThemeProvider>
        <ResourceNotFound resource="Resource" customMessage={message} />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(queryByText(message)).toBeInTheDocument();
      });
    });
  });
});
