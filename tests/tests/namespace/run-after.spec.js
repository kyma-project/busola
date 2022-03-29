/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Namespace', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });
  it('Delete the Namespace (step 1)', () => {
    cy.get('[data-testid=luigi-topnav-logo]').click();

    cy.get('[data-testid=namespaces_namespaces]').click(); //we need to use force when others elements make menu not visible
    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(Cypress.env('NAMESPACE_NAME'), {
        force: true,
      }); // use force to skip clicking (the table could re-render between the click and the typing)

    cy.getIframeBody()
      .find('tbody tr [aria-label="Delete"]')
      .click({ force: true });

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();
  });

  it('Check if the Namespace is terminated (step 2)', { retries: 3 }, () => {
    cy.getIframeBody()
      .find('tbody tr [role="status"]')
      .should('have.text', 'Terminating');
  });
});
