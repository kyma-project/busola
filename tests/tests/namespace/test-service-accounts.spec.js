/// <reference types="cypress" />

const SERVICE_NAME = 'test-sa-name';

context('Test Service Accounts', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Service Account', () => {
    cy.wait(500); // TODO
    cy.navigateTo('Configuration', 'Service Accounts');

    cy.contains('Create Service Account').click();

    cy.contains('Advanced').click();

    cy.get('[ariaLabel="ServiceAccount name"]')
      .clear()
      .type(SERVICE_NAME);

    cy.contains('Image Pull Secrets').click();

    cy.get(
      '[placeholder="Start typing to select Image Pull Secrets from the list"]',
    )
      .clear()
      .type('default');

    cy.contains('default-token').click();

    cy.get('[role="presentation"]').click();

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.contains(SERVICE_NAME).should('be.visible');

    cy.contains(`${SERVICE_NAME}-token`).should('be.visible');

    cy.contains('default-token').should('be.visible');

    cy.contains('enabled').should('be.visible');
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

    cy.get('[role="presentation"]').click();

    cy.get('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updated details', () => {
    cy.contains('disabled').should('be.visible');

    cy.contains('test.key=test-value').should('be.visible');
  });

  it('Inspect list', () => {
    cy.inspectList('Service Accounts', SERVICE_NAME);
  });
});
