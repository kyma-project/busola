/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const NAMESPACE_NAME = config.namespace;

context('Busola - Smoke Tests', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  it('Renders navigation nodes', () => {
    ['Namespaces', 'Administration', 'Diagnostics'].forEach(node => {
      getLeftNav()
        .contains(node)
        .should('be.visible');
    });
  });

  it('Create a new namespace', () => {
    getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('Create Namespace')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[placeholder='Namespace name']")
      .should('be.visible')
      .type(NAMESPACE_NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Go to the details of namespace and check sections', () => {
    cy.getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .click();

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
    getLeftNav()
      .contains('Back to Namespaces')
      .click();

    cy.url().should('match', /namespaces$/);
  });

  it('Check Administration tab', () => {
    getLeftNav()
      .contains('Administration')
      .click();

    getLeftNav()
      .contains('Cluster Roles')
      .should('be.visible');

    getLeftNav()
      .contains('Cluster Role Bindings')
      .should('be.visible');
  });

  it('Check Diagnostic tab', () => {
    getLeftNav()
      .contains('Diagnostic')
      .click();

    getLeftNav()
      .contains('Logs')
      .should('be.visible');

    getLeftNav()
      .contains('Metrics')
      .should('be.visible');

    getLeftNav()
      .contains('Traces')
      .should('be.visible');

    getLeftNav()
      .contains('Service Mesh')
      .should('be.visible');
  });
});
