import { act, render, waitFor } from 'testing/reactTestingUtils';
import { ReleaseDataPanel } from '../ReleaseDataPanel';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('ReleaseDataPanel', () => {
  it('Renders release data', async () => {
    const release = {
      name: 'mock-release',
      version: '8',
      chart: {
        metadata: {
          name: 'mock-chart-name',
          description: 'mock-chart-description',
          version: 'mock-chart-version',
        },
      },
      info: {
        first_deployed: new Date(1410, 7, 10).toISOString(),
        last_deployed: new Date(1996, 5, 30).toISOString(),
      },
    };
    const { queryByText } = render(
      <ThemeProvider>
        <ReleaseDataPanel release={release} />
      </ThemeProvider>,
    );
    await waitFor(async () => {
      await act(async () => {
        expect(queryByText('mock-chart-name')).toBeInTheDocument();
        expect(queryByText('mock-chart-description')).toBeInTheDocument();
        expect(queryByText('mock-chart-version')).toBeInTheDocument();
      });
    });
  });
});
