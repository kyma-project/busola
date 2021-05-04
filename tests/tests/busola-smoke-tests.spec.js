/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const random = Math.floor(
  Math.random() * 10 + Math.random() * 100 + Math.random() * 1000,
);
const NAMESPACE_NAME = `orders-service-${random}`;

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  debugger;
  return false;
});

context('Busola Smoke Tests', () => {
  before(() => {
    cy.visit(ADDRESS)
      .contains('Drag file here')
      .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

    cy.wait(5000); //it fixes error with loading namespaces
  });

  it('Renders navigation nodes', () => {
    ['Namespaces', 'Administration', 'Diagnostics'].forEach(node => {
      cy.get('nav[data-testid=semiCollapsibleLeftNav]')
        .contains(node)
        .should('be.visible');
    });
  });

  it('Create a new namespace', () => {
    cy.get('nav[data-testid=semiCollapsibleLeftNav]')
      .contains('Namespaces')
      .click();

    cy.getIframeBody()
      .contains('Create Namespace')
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('.fd-form-item', 'Name') //doesn't work without class name
      .should('be.visible')
      .type(NAMESPACE_NAME);

    cy.getIframeBody()
      .contains('.fd-bar__element > button', 'Create') //doesn't work without selector
      .should('be.visible')
      .click()
      .getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .should('be.visible')
      .click()
      .getIframeBody()
      .contains('Healthy Resources')
      .should('be.visible')
      .getIframeBody()
      .contains('Limit Ranges')
      .should('be.visible')
      .getIframeBody()
      .contains('Resource Quotas')
      .should('be.visible')
      .getIframeBody()
      .contains('Application Mappings')
      .should('be.visible')
      .getIframeBody()
      .contains('Healthy Resources')
      .should('be.visible')
      .getIframeBody()
      .contains('Warnings')
      .should('be.visible')
      .get('body')
      .contains('Back to Namespaces')
      .click();
  });

  // Administration
  it('Check Administration tab', () => {
    cy.contains('Administration')
      .click()
      .get('body')
      .contains('Cluster Roles')
      .click()
      .getIframeBody()
      .contains('admin')
      .should('be.visible')
      .get('body')
      .contains('Cluster Role Bindings')
      .click()
      .getIframeBody()
      .contains('cluster-admin')
      .should('be.visible');
  });

  // Diagnostic
  it('Check Diagnostic tab', () => {
    cy.contains('Diagnostic')
      .click()
      .get('body')
      .contains('Logs')
      .should('be.visible')
      .get('body')
      .contains('Metrics')
      .should('be.visible')
      .get('body')
      .contains('Traces')
      .should('be.visible')
      .get('body')
      .contains('Service Mesh')
      .should('be.visible');
  });
});
