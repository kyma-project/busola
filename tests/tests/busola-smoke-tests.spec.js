/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const random = Math.floor(Math.random() * 1000);
const NAMESPACE_NAME = `a-busola-test-${random}`;

context('Busola Smoke Tests', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  before(() => {
    cy.visit(ADDRESS)
      .contains('Drag file here')
      .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

    cy.get('#error').should('not.exist');
    cy.url().should('eq', ADDRESS + '/home/workspace');
    cy.getIframeBody()
      .find('thead')
      .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.
  });

  after(() => {
    getLeftNav()
      .contains('Namespaces') //it finds Namespaces (expected) or Back to Namespaces (if tests fail in the middle)
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
      .contains('Application Mappings')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Warnings')
      .should('be.visible');
  });

  it('Go back to the namespaces list', () => {
    getLeftNav()
      .contains('Back to Namespaces')
      .click();

    cy.url().should('eq', ADDRESS + '/home/workspace');
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
