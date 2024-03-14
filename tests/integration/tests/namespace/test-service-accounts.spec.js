/// <reference types="cypress" />
const path = require('path');

const SERVICE_NAME = `test-sa-name-${Math.floor(Math.random() * 9999) + 1000}`;
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

    cy.contains('ui5-button', 'Create').click();

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

    cy.get('.create-form')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.getMidColumn()
      .contains('ui5-title', SERVICE_NAME)
      .should('be.visible');

    cy.getMidColumn()
      .contains('enabled')
      .should('be.visible');

    cy.getMidColumn()
      .contains('kubernetes.io/service-account-token')
      .should('be.visible');
  });

  it('Edit', () => {
    cy.inspectTab('Edit');

    cy.get('.edit-form')
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
    cy.get('ui5-switch:visible')
      .find('input')
      .eq(0)
      .click({ force: true });

    cy.saveEdit();
  });

  it('Checking updated details', () => {
    cy.inspectTab('View');

    cy.getMidColumn()
      .contains('disabled')
      .should('be.visible');

    cy.getMidColumn()
      .contains('test.key=test-value')
      .should('be.visible');
  });

  it('Generate TokenRequest', () => {
    cy.getMidColumn()
      .contains('ui5-button', 'Generate TokenRequest')
      .click();

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
    cy.inspectList(SERVICE_NAME);
  });
});
