import { render, act, waitFor } from 'testing/reactTestingUtils';
import { Selector } from '../Selector';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

vi.mock('../../RelatedPods.js', () => ({
  RelatedPods: ({ namespace }) => <div>Related Pods for {namespace}</div>,
}));

describe('Selector tests', () => {
  afterEach(async () => {
    await cleanup();
    await vi.clearAllMocks();
    await vi.useRealTimers();
  });

  describe('Selector tests for Kubernetes resources', () => {
    it('Does not render Selector when selector is null', async () => {
      const { queryByText } = render(
        <ThemeProvider>
          <Selector selector={null} />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(queryByText('selector.title')).not.toBeInTheDocument();
        });
      });
    });
  });
});
