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

    cy.get('ui5-button[aria-label="open-search"]:visible')
      .click()
      .get('ui5-combobox[placeholder="Search"]')
      .find('input')
      .click()
      .type(Cypress.env('NAMESPACE_NAME'));

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
