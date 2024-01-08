/// <reference types="cypress" />
const path = require('path');

const SERVICE_NAME = 'test-sa-name';
const DOWNLOADS_FOLDER = Cypress.config('downloadsFolder');

const filepath = path.join(DOWNLOADS_FOLDER, `${SERVICE_NAME}.yaml`);

context('Test Service Accounts', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Service Account', () => {
    cy.navigateTo('Configuration', 'Service Accounts');

    cy.contains('ui5-button', 'Create Service Account').click();

    cy.contains('Advanced').click();

    cy.get('[aria-label="ServiceAccount name"]')
      .find('input')
      .click()
      .clear()
      .type(SERVICE_NAME);

    // Toggle 'Automount Token' switch
    cy.get('ui5-switch')
      .find('input')
      .eq(0)
      .click({ force: true });

    // Toggle 'Create associated Secret' switch
    cy.get('ui5-switch')
      .find('input')
      .eq(1)
      .click({ force: true });

    cy.contains('The associated Secret contains long-lived API token').should(
      'be.visible',
    );

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.contains('ui5-title', SERVICE_NAME).should('be.visible');

    cy.contains('enabled').should('be.visible');

    cy.contains('kubernetes.io/service-account-token').should('be.visible');
  });

  it('Edit', () => {
    cy.get('ui5-button')
      .contains('Edit')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .contains('Labels')
      .click();

    cy.get('[placeholder="Enter key"]:visible')
      .find('input')
      .filterWithNoValue()
      .type('test.key');

    cy.get('[placeholder="Enter value"]:visible')
      .find('input')
      .filterWithNoValue()
      .first()
      .type('test-value');

    // Toggle 'Automount Token' switch
    cy.get('ui5-switch')
      .find('input')
      .eq(0)
      .click({ force: true });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Update')
      .should('be.visible')
      .click();
  });

  it('Checking updated details', () => {
    cy.contains('disabled').should('be.visible');

    cy.contains('test.key=test-value').should('be.visible');
  });

  it('Generate TokenRequest', () => {
    cy.contains('ui5-button', 'Generate TokenRequest').click();

    cy.contains(
      'The TokenRequest allows you to log in with your ServiceAccount credentials.',
    ).should('be.visible');

    cy.contains('TokenRequest generated').should('be.visible');
    cy.readFile(filepath).should('not.exist');

    //check if TokenRequest is being generated after value change
    cy.get('.form-field')
      .find('ui5-icon')
      .click()
      .get('ui5-list')
      .contains('21600s (6h)')
      .click();

    cy.contains('TokenRequest generated').should('be.visible');
    cy.readFile(filepath).should('not.exist');

    cy.contains('ui5-button', 'Download Kubeconfig').click();

    cy.readFile(filepath).should('exist');
    cy.task('removeFile', filepath);

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Close')
      .should('be.visible')
      .click();
  });

  it('Inspect list', () => {
    cy.inspectList('Service Accounts', SERVICE_NAME);
  });
});
