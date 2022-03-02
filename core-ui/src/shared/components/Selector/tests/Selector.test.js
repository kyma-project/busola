import { render } from '@testing-library/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Selector } from '../Selector';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: key => key,
  }),
}));

jest.mock('../../RelatedPods.js', () => ({
  RelatedPods: ({ namespace }) => <div>Related Pods for {namespace}</div>,
}));

describe('Selector tests', () => {
  describe('Selector tests for Kubernetes resources', () => {
    it('Does not render Selector when selector is null', () => {
      const { queryByText } = render(<Selector selector={null} />);
      expect(queryByText('selector.title')).not.toBeInTheDocument();
    });

    it('Renders default message when selector labels are null', () => {
      const mockedSelector = {};

      const { getByText } = render(<Selector selector={mockedSelector} />);
      expect(getByText('selector.message.empty-selector')).toBeInTheDocument();
    });

    it('Renders Selector with labels and pods list', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { getByText } = render(
        <Selector
          selector={mockedSelector}
          namespace="test-namespace"
          labels={mockedSelector.matchLabels}
        />,
      );

      expect(getByText('Related Pods for test-namespace')).toBeInTheDocument();
      expect(getByText('test=test')).toBeInTheDocument(); // selector labels
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

      const { getByText } = render(
        <Selector
          selector={mockedSelector}
          namespace="namespace"
          labels={mockedSelector.matchLabels}
          expressions={mockedSelector.matchExpressions}
        />,
      );

      expect(getByText('match-expressions.title')).toBeInTheDocument(); //title of the matchExpressions table
      expect(getByText('test=test')).toBeInTheDocument();
      expect(getByText('test-key')).toBeInTheDocument(); // matchExpressions elements
      expect(getByText('In')).toBeInTheDocument();
      expect(getByText('test-value')).toBeInTheDocument();
    });

    it('Renders custom message when selector labels are null ', () => {
      const mockedSelector = {};
      const { t } = useTranslation();
      const { getByText } = render(
        <Selector
          selector={mockedSelector}
          message={t('persistent-volume-claims.message.empty-selector')}
        />,
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
        <Selector
          selector={mockedSelector}
          labels={mockedSelector.matchLabels}
          namespace="namespace"
          RelatedResources={() => <p>Persistent Volumes</p>}
        />,
      );

      expect(getByText('Persistent Volumes')).toBeInTheDocument();
    });
  });

  describe('Selector tests for Istio resources', () => {
    it('Renders message when selector is null', () => {
      const { getByText } = render(
        <Selector selector={null} isIstioSelector />,
      );
      expect(getByText('selector.message.empty-selector')).toBeInTheDocument();
    });

    it('Renders Selector with custom title', () => {
      const { t } = useTranslation();

      const { getByText } = render(
        <Selector
          selector={null}
          title={t('workload-selector-title')}
          isIstioSelector
        />,
      );
      expect(getByText('workload-selector-title')).toBeInTheDocument();
    });

    it('Renders Selector with non-empty labels', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      const { getByText } = render(
        <Selector
          selector={mockedSelector}
          labels={mockedSelector.matchLabels}
          namespace="namespace"
          isIstioSelector
          RelatedResources={() => <p>Custom Resources</p>}
        />,
      );

      expect(getByText('Custom Resources')).toBeInTheDocument();
      expect(getByText('test=test')).toBeInTheDocument();
    });
  });
});
