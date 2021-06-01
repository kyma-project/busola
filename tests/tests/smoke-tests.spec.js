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
      .contains('Resource consumption')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Limit Ranges')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Resource Quotas')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Warnings')
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
    ['Administration', 'Diagnostics'].forEach(node => {
      cy.getLeftNav()
        .contains(node)
        .should('be.visible');
    });
  });

  it('Check Administration tab', () => {
    cy.getLeftNav()
      .contains('Administration')
      .click();

    cy.getLeftNav()
      .contains('Cluster Roles')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Cluster Role Bindings')
      .should('be.visible');
  });

  it('Check Diagnostic tab', () => {
    cy.getLeftNav()
      .contains('Diagnostic')
      .click();

    cy.getLeftNav()
      .contains('Logs')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Metrics')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Traces')
      .should('be.visible');

    cy.getLeftNav()
      .contains('Service Mesh')
      .should('be.visible');
  });
});
