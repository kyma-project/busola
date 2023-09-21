import { render } from 'testing/reactTestingUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Selector } from '../Selector';
import { ThemeProvider } from '@ui5/webcomponents-react';

jest.mock('../../RelatedPods.js', () => ({
  RelatedPods: ({ namespace }) => <div>Related Pods for {namespace}</div>,
}));

describe('Selector tests', () => {
  describe('Selector tests for Kubernetes resources', () => {
    it('Does not render Selector when selector is null', () => {
      const { queryByText } = render(
        <ThemeProvider>
          <Selector selector={null} />
        </ThemeProvider>,
      );
      expect(queryByText('selector.title')).not.toBeInTheDocument();
    });

    it('Renders default message when selector labels are null', () => {
      const mockedSelector = {};

      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={mockedSelector} />
        </ThemeProvider>,
      );
      expect(getByText('selector.message.empty-selector')).toBeInTheDocument();
    });

    it('Renders Selector with labels and pods list', () => {
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

      expect(getByText('Related Pods for test-namespace')).toBeInTheDocument();
      expect(container.querySelector("[text='test=test']")).toBeInTheDocument(); // selector labels
    });

    it('Renders Selector with matchExpressions and without pods list', () => {
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

      expect(getByText('match-expressions.title')).toBeInTheDocument(); //title of the matchExpressions table
      expect(container.querySelector("[text='test=test']")).toBeInTheDocument();
      expect(getByText('test-key')).toBeInTheDocument(); // matchExpressions elements
      expect(getByText('In')).toBeInTheDocument();
      expect(
        container.querySelector("[text='test-value']"),
      ).toBeInTheDocument();
    });

    it('Renders custom message when selector labels are null ', () => {
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

      expect(
        getByText('persistent-volume-claims.message.empty-selector'),
      ).toBeInTheDocument();
    });

    it('Renders Selector with custom RelatedResources', () => {
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

      expect(getByText('Persistent Volumes')).toBeInTheDocument();
    });
  });

  describe('Selector tests for Istio resources', () => {
    it('Renders message when selector is null', () => {
      const { getByText } = render(
        <ThemeProvider>
          <Selector selector={null} isIstioSelector />
        </ThemeProvider>,
      );
      expect(getByText('selector.message.empty-selector')).toBeInTheDocument();
    });

    it('Renders Selector with custom title', () => {
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
      expect(getByText('workload-selector-title')).toBeInTheDocument();
    });

    it('Renders Selector with non-empty labels', () => {
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

      expect(getByText('Custom Resources')).toBeInTheDocument();
      expect(container.querySelector("[text='test=test']")).toBeInTheDocument();
    });
  });
});
