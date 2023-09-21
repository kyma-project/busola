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

    cy.contains('Create Service Account').click();

    cy.contains('Advanced').click();

    cy.get('[ariaLabel="ServiceAccount name"]')
      .clear()
      .type(SERVICE_NAME);

    // Toggle 'Automount Token' switch
    cy.get('ui5-switch')
      .eq(0)
      .click();

    // Toggle 'Create associated Secret' switch
    cy.get('ui5-switch')
      .eq(1)
      .click();

    cy.contains('The associated Secret contains long-lived API token').should(
      'be.visible',
    );

    cy.get('[role="dialog"]')
      .get('ui5-button.fd-dialog__decisive-button')
      .contains('Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.contains(SERVICE_NAME, { includeShadowDom: false }).should('be.visible');

    cy.contains('enabled').should('be.visible');

    cy.contains('kubernetes.io/service-account-token').should('be.visible');
  });

  it('Edit', () => {
    cy.contains('Edit').click();

    cy.get('[role="document"]')
      .contains('Labels')
      .click();

    cy.get('[placeholder="Enter key"]:visible')
      .filterWithNoValue()
      .type('test.key');

    cy.get('[placeholder="Enter value"]:visible')
      .filterWithNoValue()
      .first()
      .type('test-value');

    // Toggle 'Automount Token' switch
    cy.get('ui5-switch')
      .eq(0)
      .click();

    cy.get('[role="dialog"]')
      .get('ui5-button.fd-dialog__decisive-button')
      .contains('Update')
      .should('be.visible')
      .click();
  });

  it('Checking updated details', () => {
    cy.contains('disabled').should('be.visible');

    cy.contains('test.key=test-value').should('be.visible');
  });

  it('Generate TokenRequest', () => {
    cy.contains('Generate TokenRequest').click();

    cy.contains(
      'The TokenRequest allows you to log in with your ServiceAccount credentials.',
    ).should('be.visible');

    cy.contains('TokenRequest generated').should('be.visible');
    cy.readFile(filepath).should('not.exist');

    cy.contains('Download Kubeconfig').click();

    cy.readFile(filepath).should('exist');
    cy.task('removeFile', filepath);

    cy.contains('Close').click();
  });

  it('Inspect list', () => {
    cy.inspectList('Service Accounts', SERVICE_NAME);
  });
});
