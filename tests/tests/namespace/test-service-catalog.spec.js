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
    cy.getIframeBody()
      .contains('a', 'Instances - Addons')
      .click();

    cy.deleteFromGenericList('gcp-service-broker');
  });
});
