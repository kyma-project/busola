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
      cy.contains('ui5-link', LIMIT_NAME).scrollIntoView().should('be.visible');

      cy.get('ui5-table[accessible-name="Limit Ranges"]')
        .find('ui5-panel')
        .find('ui5-table-row')
        .find('ui5-table-cell')
        .contains('Container')
        .scrollIntoView()
        .should('be.visible');

      cy.get('.ui5-dynamic-page-scroll-container').scrollTo('center');
      cy.contains('ui5-link', QUOTA_NAME).should('be.visible');

      cy.contains('Pods Overview').scrollIntoView().should('be.visible');

      cy.contains('Deployments Overview').scrollIntoView().should('be.visible');

      cy.contains('Events').scrollIntoView().should('be.visible');

      cy.contains('CPU Usage').scrollIntoView().should('be.visible');

      cy.contains('Memory Usage').scrollIntoView().should('be.visible');
    });
  },
);
