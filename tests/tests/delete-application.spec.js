/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up application', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Nawigate to Application', () => {
    cy.getLeftNav()
      .contains('Integration')
      .click();

    cy.getLeftNav()
      .contains('Applications')
      .click();
  });

  it('Delete the application (step 1)', () => {
    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type('test-mock-app');

    cy.getIframeBody()
      .find('tbody tr [aria-label="Delete"]')
      .click({ force: true });

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();
  });

  it('Check if the application is deleted (step 2)', () => {
    cy.getIframeBody()
      .contains('test-mock-app')
      .should('not.exist');
  });
});
