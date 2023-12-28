import { act, render, waitFor } from 'testing/reactTestingUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Selector } from '../Selector';
import { ThemeProvider } from '@ui5/webcomponents-react';

jest.mock('../../RelatedPods.js', () => ({
  RelatedPods: ({ namespace }) => <div>Related Pods for {namespace}</div>,
}));

describe('Selector tests', () => {
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

      const { container, getByText } = render(
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
          expect(
            container.querySelector("[text='test=test']"),
          ).toBeInTheDocument(); // selector labels
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

      const { container, getByText } = render(
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
          expect(getByText('match-expressions.title')).toBeInTheDocument(); //title of the matchExpressions table
          expect(
            container.querySelector("[text='test=test']"),
          ).toBeInTheDocument();
          expect(getByText('test-key')).toBeInTheDocument(); // matchExpressions elements
          expect(getByText('In')).toBeInTheDocument();
          expect(
            container.querySelector("[text='test-value']"),
          ).toBeInTheDocument();
        });
      });
    });

    it('Renders custom message when selector labels are null ', async () => {
      const mockedSelector = {};
      const { t } = useTranslation();
      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={mockedSelector}
            message={t('persistent-volume-claims.message.empty-selector')}
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(
            getByText('persistent-volume-claims.message.empty-selector'),
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
      const { t } = useTranslation();

      const { getByText } = render(
        <ThemeProvider>
          <Selector
            selector={null}
            title={t('workload-selector-title')}
            isIstioSelector
          />
        </ThemeProvider>,
      );
      await waitFor(async () => {
        await act(async () => {
          expect(getByText('workload-selector-title')).toBeInTheDocument();
        });
      });
    });

    it('Renders Selector with non-empty labels', async () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { container, getByText } = render(
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
          expect(
            container.querySelector("[text='test=test']"),
          ).toBeInTheDocument();
        });
      });
    });
  });
});
