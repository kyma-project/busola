/// <reference types="cypress" />
import 'cypress-file-upload';

const LIMIT_NAME = `${Cypress.env('NAMESPACE_NAME')}-limits`;
const QUOTA_NAME = `${Cypress.env('NAMESPACE_NAME')}-quotas`;

context(
  'Check the namespace overview for limit ranges and resourcequotas',
  () => {
    Cypress.skipAfterFail();

    before(() => {
      cy.loginAndSelectCluster();
      cy.goToNamespaceDetails();
    });

    it('Check sections of namespace details', () => {
      cy.contains('ui5-text', LIMIT_NAME)
        .scrollIntoView()
        .should('be.visible');

      cy.contains('Container').should('be.visible');

      cy.contains('ui5-text', QUOTA_NAME)
        .scrollIntoView()
        .should('be.visible');

      cy.contains('Pods Overview')
        .scrollIntoView()
        .should('be.visible');

      cy.contains('Deployments Overview')
        .scrollIntoView()
        .should('be.visible');

      cy.contains('Events')
        .scrollIntoView()
        .should('be.visible');
    });

    it('checks the visibility of charts', () => {
      cy.get('body').then($body => {
        if ($body.find('[aria-label="Loading"]').length) {
          cy.get('ui5-busy-indicator').should('be.visible');
        } else if ($body.find('.pods-metrics-error').length) {
          cy.get(
            'ui5-card-header[title-text="Error while loading memory consumption data"]',
          ).should('be.visible');
        } else if ($body.find('.radial-chart-card').length) {
          cy.contains('CPU Usage').should('be.visible');
          cy.contains('Memory Usage').should('be.visible');
        }
      });
    });
  },
);
