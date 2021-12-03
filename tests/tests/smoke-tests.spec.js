/// <reference types="cypress" />
import 'cypress-file-upload';

context('Smoke Tests', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Check sections of namespace details', () => {
    cy.getIframeBody()
      .contains('Healthy Resources')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Resource Consumption')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Limit Ranges')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Resource Quotas')
      .should('be.visible');

    cy.getIframeBody()
      .contains('All Messages')
      .should('be.visible');
  });

  it('Go back to the namespaces list', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.url().should('match', /namespaces$/);
  });

  it('Renders navigation nodes', () => {
    cy.get('[data-testid=luigi-topnav-logo]').click();
    cy.getLeftNav()
      .contains('Configuration')
      .should('be.visible');
  });

  it('Check Configuration tab', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Cluster Roles')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Cluster Role Bindings')
      .should('be.visible');
  });
});
