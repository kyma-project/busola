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

    cy.contains(`delete Namespace ${Cypress.env('NAMESPACE_NAME')}`);
    cy.get(`[header-text="Delete Namespace"]`)
      .find('[data-testid="delete-confirmation"]')
      .click();
  });

  it('Check if the Namespace is terminated (step 2)', { retries: 3 }, () => {
    cy.get('ui5-table-row')
      .find('.status-badge')
      .contains('Terminating');

    cy.get('ui5-table')
      .contains(Cypress.env('NAMESPACE_NAME'))
      .should('not.exist');
  });
});
