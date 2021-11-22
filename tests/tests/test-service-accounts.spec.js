/// <reference types="cypress" />

const SERVICE_NAME = 'test-sa-name';

context('Test Service Accounts', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Navigate to Service Accounts', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Service Accounts')
      .click();
  });

  it('Create a Client', () => {
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
    cy.wait(40000);
  });
});
