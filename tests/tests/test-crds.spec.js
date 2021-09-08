/// <reference types="cypress" />
import 'cypress-file-upload';

context('Test Custom Resource Definitions (Namespace Wide)', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Test Custom Resource Definitions list', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .find('[data-testid=customresourcedefinitions_customresourcedefinitions]')
      .click();

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type('functions', { force: true }); // use force to skip clicking (the table could re-render between the click and the typing)

    cy.getIframeBody()
      .contains('tbody tr td a', 'functions')
      .click({ force: true });
  });

  it('Test Custom Resource Definitions details', () => {
    cy.getIframeBody()
      .find('[data-testid=crd-names]')
      .contains('td', 'functions', { timeout: 7000 })
      .should('be.visible');

    //// The table Additional Printer Columns is empty only in Chrome managed by Cypress
    // cy.getIframeBody()
    //   .find('[data-testid=crd-additional-printer-columns]')
    //   .contains('td', 'Age', { timeout: 7000 })
    //   .should('be.visible');

    cy.getIframeBody()
      .contains('h3', 'Schema', { timeout: 7000 })
      .should('be.visible');

    cy.getIframeBody()
      .find('[data-testid=crd-custom-resources]')
      .find('tbody tr td a', { timeout: 7000 })
      .first()
      .click({ force: true });
  });

  it('Test Custom Resource details', () => {
    // The table Additional Printer Columns is empty only in Chrome managed by Cypress
    // cy.getIframeBody()
    //   .find('[data-testid=cr-additional-printer-columns]')
    //   .contains('td', 'Age', { timeout: 7000 })
    //   .should('be.visible');
  });

  it('Test Custom Resource Definitions list (Cluster Wide)', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .find('[data-testid=customresourcedefinitions_customresourcedefinitions]')
      .click();

    cy.wait(10000);
    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]', { timeout: 7000 })
      .type('applications', { force: true }); // use force to skip clicking (the table could re-render between the click and the typing)

    cy.getIframeBody()
      .contains('tbody tr td a', 'applications')
      .should('be.visible');
  });
});
