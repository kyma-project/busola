/// <reference types="cypress" />

const SERVICE_NAME = 'test-sa-name';

context('Test Service Accounts', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Client', () => {
    cy.navigateTo('Configuration', 'Service Accounts');

    cy.getIframeBody()
      .contains('Create Service Account')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Service Account Name"]')
      .clear()
      .type(SERVICE_NAME);

    cy.getIframeBody()
      .contains('Image Pull Secrets')
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Start typing to select Image Pull Secrets from the list."]',
      )
      .clear()
      .type('default');

    cy.getIframeBody()
      .contains('default-token')
      .click();

    cy.getIframeBody()
      .find('[role="presentation"]')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(SERVICE_NAME)
      .should('be.visible');

    cy.getIframeBody()
      .contains(`${SERVICE_NAME}-token`)
      .should('be.visible');

    cy.getIframeBody()
      .contains('default-token')
      .should('be.visible');

    cy.getIframeBody()
      .contains('enabled')
      .should('be.visible');
  });

  it('Edit', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role="document"]')
      .contains('Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .type('test.key');

    cy.getIframeBody()
      .find('[index="1"]')
      .clear()
      .type('test-value');

    cy.getIframeBody()
      .find('[role="presentation"]')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updated details', () => {
    cy.getIframeBody()
      .contains('disabled')
      .should('be.visible');

    cy.getIframeBody()
      .contains('test.key=test-value')
      .should('be.visible');
  });

  it('Delete Service Account', () => {
    cy.deleteInDetails();
  });
});
