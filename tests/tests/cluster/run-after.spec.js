/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up namespace', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Delete the application', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type(Cypress.env('APP_NAME'));

    cy.getIframeBody()
      .find('tbody tr [aria-label="Delete"]')
      .click({ force: true });

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();
  });
});
