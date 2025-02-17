/// <reference types="cypress" />
import { is } from 'core-js/core/object';
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
      const isLoading = cy.get('[aria-label="Loading"]');
      const isError = cy.get('.pods-metrics-error');

      if (isLoading) {
        cy.get('ui5-busy-indicator').should('be.visible');
      } else if (isError) {
        cy.get(
          'ui5-card-header[title-text="Error while loading memory consumption data"]',
        ).should('be.visible');
      } else {
        cy.contains('CPU Usage').should('be.visible');
        cy.contains('Memory Usage').should('be.visible');
      }
    });
  },
);
