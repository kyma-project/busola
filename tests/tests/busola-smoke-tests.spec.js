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
      .get('#file-input')
      .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });
  });

  it('Renders navigation nodes', () => {
    ['Namespaces', 'Administration', 'Diagnostics'].forEach(node => {
      cy.contains(node).should('exist');
    });
  });

  //TODO: Check if namespace already exists
  it('Create a new namespace', () => {
    cy.contains('Namespaces')
      .click()
      .getIframeBody()
      .contains('tr', config.DEFAULT_NAMESPACE_NAME)
      .should('be.visible')
      .getIframeBody()
      .contains('Create Namespace')
      .should('be.visible')
      .click()
      .getIframeBody()
      .contains('div .fd-form__item', 'Name')
      .should('be.visible')
      .type(NAMESPACE_NAME)
      .getIframeBody()
      .contains('.fd-modal__footer > button', 'Create')
      .should('be.visible')
      .click()
      .getIframeBody()
      .contains('tr', NAMESPACE_NAME)
      .should('be.visible')
      .click(); // doesn't work - Could not lazy-load children for node TypeError: Cannot read property 'config' of null
  });

  // TODO: 'Integration' (not always visible)

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
      .contains('api-gateway-role')
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
