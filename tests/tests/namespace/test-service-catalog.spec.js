/// <reference types="cypress" />

context('Test Service Catalog', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Go to a Service Class details', () => {
    cy.navigateTo('Service Management', 'Catalog');

    cy.getIframeBody()
      .contains('Add-Ons')
      .click();

    cy.getIframeBody()
      .contains('GCP Service Broker')
      .click();
  });

  it('Create a Service Class instance', () => {
    cy.getIframeBody()
      .contains('Add once')
      .click();

    cy.getIframeBody()
      .find('[label="GCP Secret name"]')
      .clear()
      .type('fake-secret-name');

    cy.getIframeBody()
      .contains('Create')
      .click();
  });

  it('Go to the Service Instances list, delete the instance', () => {
    const searchTerm = 'gcp-service-broker';
    cy.getIframeBody()
      .contains('a', 'Instances - Addons')
      .click();

    //we don't use the deleteFromGenericList function since Catalog code is a bit different
    cy.getIframeBody()
      .find('[aria-label="open-search"]')
      .filter(':visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Search"]')
      .filter(':visible', { log: false })
      .first()
      .type(searchTerm);

    cy.getIframeBody()
      .contains(searchTerm)
      .should('be.visible');

    cy.getIframeBody()
      .find('[aria-label="Delete Instance"]')
      .first()
      .click();

    cy.contains('button', 'Delete').click();
  });
});
