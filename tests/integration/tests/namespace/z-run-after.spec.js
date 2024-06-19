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

    cy.deleteFromGenericList('Namespace', Cypress.env('NAMESPACE_NAME'), {
      clearSearch: false,
      checkIfResourceIsRemoved: false,
      selectSearchResult: true,
    });

    cy.get('ui5-table-row')
      .find('.status-badge')
      .contains('Terminating');
  });

  it(
    'Check if the Namespace is terminated (step 2)',
    {
      retries: {
        runMode: 3,
        openMode: 3,
      },
    },
    () => {
      cy.get('ui5-table')
        .contains(Cypress.env('NAMESPACE_NAME'))
        .should('not.exist', { timeout: 50000 });
    },
  );
});
