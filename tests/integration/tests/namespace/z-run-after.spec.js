/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Namespace', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });
  it('Delete the Namespace (step 1)', () => {
    cy.getLeftNav()
      .contains('Namespaces')
      .click();

    cy.get('[role="search"] [aria-label="search-input"]').type(
      Cypress.env('NAMESPACE_NAME'),
      {
        force: true,
      },
    ); // use force to skip clicking (the table could re-render between the click and the typing)

    cy.get('ui5-table-row [aria-label="Delete"]').click({ force: true });

    cy.get(`[header-text="Delete ${Cypress.env('NAMESPACE_NAME')}"]`)
      .find('[data-testid="delete-confirmation"]')
      .click();
  });

  it('Check if the Namespace is terminated (step 2)', { retries: 3 }, () => {
    cy.get('[role=row]')
      .find('[role="status"]')
      .should('have.text', 'Terminating');
  });
});
