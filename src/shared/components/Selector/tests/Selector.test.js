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

    it('Renders default message when selector labels are null', async () => {
      const mockedSelector = {};

      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={mockedSelector} />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            getByText('selector.message.empty-selector'),
          ).toBeInTheDocument();
        });
      });
    });

    it('Renders Selector with labels and pods list', async () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            namespace="test-namespace"
            labels={mockedSelector.matchLabels}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            getByText('Related Pods for test-namespace'),
          ).toBeInTheDocument();
          expect(getByText('test=test')).toBeInTheDocument(); // selector labels
        });
      });
    });
  });
});
