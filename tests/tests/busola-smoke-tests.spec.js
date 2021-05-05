/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const random = Math.floor(
  Math.random() * 10 + Math.random() * 100 + Math.random() * 1000,
);
const NAMESPACE_NAME = `a-busola-test-${random}`;

context('Busola Smoke Tests', () => {
  before(() => {
    cy.visit(ADDRESS)
      .contains('Drag file here')
      .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

    cy.wait(2000); //it fixes error with loading namespaces
  });

  after(() => {
    cy.get('nav[data-testid=semiCollapsibleLeftNav]')
      .contains('Namespaces') //it finds Namespaces and Back to Namespaces
      .click();

    cy.getIframeBody()
      .find('[aria-label="open-search"]')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Search"]')
      .type(NAMESPACE_NAME);

    cy.getIframeBody()
      .find('[aria-label="Delete"]')
      .click();

    cy.getIframeBody()
      .find('[role="status"]')
      .should('have.text', 'TERMINATING');
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
      .find('[role=dialog]')
      .find("input[placeholder='Namespace name']")
      .should('be.visible')
      .type(NAMESPACE_NAME);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Go to the details of namespace and check sections', () => {
    cy.getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .should('be.visible')
      .click();

    cy.getIframeBody()
      .contains('Healthy Resources')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Limit Ranges')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Resource Quotas')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Application Mappings')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Healthy Resources')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Warnings')
      .should('be.visible');
  });

  it('Go back to the namespaces list', () => {
    cy.get('body')
      .get('nav[data-testid=semiCollapsibleLeftNav]')
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
