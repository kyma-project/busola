/* global cy */
import { useTranslation } from 'react-i18next';
import { Selector } from '../Selector';

const MockedRelatedPods = ({ namespace }) => (
  <div>Related Pods for {namespace}</div>
);

describe('Selector tests', () => {
  describe('Selector tests for Kubernetes resources', () => {
    it('Does not render Selector when selector is null', () => {
      cy.mount(<Selector selector={null} />);
      cy.contains('selector.title').should('not.exist');
    });

    it('Renders default message when selector labels are null', () => {
      const mockedSelector = {};

      cy.mount(<Selector selector={mockedSelector} />);
      cy.contains('selector.message.empty-selector').should('be.visible');
    });

    it('Renders Selector with labels and pods list', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };

      cy.mount(
        <Selector
          selector={mockedSelector}
          namespace="test-namespace"
          labels={mockedSelector.matchLabels}
          RelatedResources={MockedRelatedPods}
        />,
      );
      cy.contains('Related Pods for test-namespace').should('be.visible');
      cy.contains('test=test').should('be.visible');
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

      cy.mount(
        <Selector
          selector={mockedSelector}
          namespace="namespace"
          labels={mockedSelector.matchLabels}
          expressions={mockedSelector.matchExpressions}
        />,
      );
      cy.contains('match-expressions.title').should('be.visible');
      cy.contains('test=test').should('be.visible');
      cy.contains('test-key').should('be.visible');
      cy.contains('In').should('be.visible');
    });

    it('Renders custom message when selector labels are null', () => {
      const mockedSelector = {};
      const CustomSelector = () => {
        const { t } = useTranslation();
        return (
          <Selector
            selector={mockedSelector}
            message={t('persistent-volume-claims.message.empty-selector')}
          />
        );
      };

      cy.mount(<CustomSelector />);
      cy.contains('persistent-volume-claims.message.empty-selector').should(
        'be.visible',
      );
    });

    it('Renders Selector with custom RelatedResources', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };
      const CustomRelatedResources = () => <p>Persistent Volumes</p>;

      cy.mount(
        <Selector
          selector={mockedSelector}
          labels={mockedSelector.matchLabels}
          namespace="namespace"
          RelatedResources={CustomRelatedResources}
        />,
      );
      cy.contains('Persistent Volumes').should('be.visible');
    });
  });

  describe('Selector tests for Istio resources', () => {
    it('Renders message when selector is null', () => {
      cy.mount(<Selector selector={null} isIstioSelector />);
      cy.contains('selector.message.empty-selector').should('be.visible');
    });

    it('Renders Selector with custom title', () => {
      const CustomTitleSelector = () => {
        const { t } = useTranslation();
        return (
          <Selector
            selector={null}
            title={t('workload-selector-title')}
            isIstioSelector
          />
        );
      };

      cy.mount(<CustomTitleSelector />);
      cy.contains('workload-selector-title').should('be.visible');
    });

    it('Renders Selector with non-empty labels', () => {
      const mockedSelector = {
        matchLabels: {
          test: 'test',
        },
      };
      const CustomRelatedResources = () => <p>Custom Resources</p>;

      cy.mount(
        <Selector
          selector={mockedSelector}
          labels={mockedSelector.matchLabels}
          namespace="namespace"
          isIstioSelector
          RelatedResources={CustomRelatedResources}
        />,
      );
      cy.contains('Custom Resources').should('be.visible');
      cy.contains('test=test').should('be.visible');
    });
  });
});
