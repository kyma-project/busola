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
      cy.get('div.cluster-stats').then($parent => {
        // Check if the proper charts are visible.
        if ($parent.find('.radial-chart-card').length) {
          cy.contains('CPU Usage').should('be.visible');
          cy.contains('Memory Usage').should('be.visible');
          // If there is no any pods usage on the namespace.
        } else {
          cy.log('Pods metrics data is empty.');
        }
      });
    });
  },
);
