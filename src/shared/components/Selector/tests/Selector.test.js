import { render, act, waitFor } from 'testing/reactTestingUtils';
import { Selector } from '../Selector';
import { ThemeProvider } from '@ui5/webcomponents-react';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

vi.mock('../../RelatedPods.js', () => ({
  RelatedPods: ({ namespace }) => <div>Related Pods for {namespace}</div>,
}));

describe.skip('Selector tests', () => {
  afterEach(async () => {
    await cleanup();
    await vi.clearAllMocks();
    await vi.useRealTimers();
  });

  describe('Selector tests for Kubernetes resources', () => {
    it.only('Does not render Selector when selector is null', async () => {
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

    it('Renders Selector with matchExpressions and without pods list', async () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
        matchExpressions: [
          { key: 'test-key', operator: 'In', values: ['test-value'] },
        ],
      };

      const { getByText, getAllByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            namespace="namespace"
            labels={mockedSelector.matchLabels}
            expressions={mockedSelector.matchExpressions}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            getAllByText('match-expressions.title')[0],
          ).toBeInTheDocument(); //title of the matchExpressions table
          expect(getAllByText('test=test')[0]).toBeInTheDocument();
          expect(getByText('test-key')).toBeInTheDocument(); // matchExpressions elements
          expect(getByText('In')).toBeInTheDocument();
        });
      });
    });

    it('Renders custom message when selector labels are null ', async () => {
      const mockedSelector = {};
      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            message={'Matches all PersistentVolumes'}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            getByText('Matches all PersistentVolumes'),
          ).toBeInTheDocument();
        });
      });
    });

    it('Renders Selector with custom RelatedResources', async () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };
      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            labels={mockedSelector.matchLabels}
            namespace="namespace"
            RelatedResources={() => <p>Persistent Volumes</p>}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(getByText('Persistent Volumes')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Selector tests for Istio resources', () => {
    it('Renders message when selector is null', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={null} isIstioSelector />
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

    it('Renders Selector with custom title', async () => {
      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={null} title={'Custom Title'} isIstioSelector />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(getByText('Custom Title')).toBeInTheDocument();
        });
      });
    });

    it('Renders Selector with non-empty labels', async () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            labels={mockedSelector.matchLabels}
            namespace="namespace"
            isIstioSelector
            RelatedResources={() => <p>Custom Resources</p>}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(getByText('Custom Resources')).toBeInTheDocument();
          expect(getByText('test=test')).toBeInTheDocument();
        });
      });
    });
  });
});
