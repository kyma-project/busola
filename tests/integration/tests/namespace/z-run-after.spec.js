/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Namespace', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Delete the Namespace (step 1)', () => {
    cy.getLeftNav().contains('Namespaces').click({ force: true });

    cy.deleteFromGenericList('Namespace', Cypress.env('NAMESPACE_NAME'), {
      clearSearch: false,
      checkIfResourceIsRemoved: false,
      selectSearchResult: true,
      searchInPlainTableText: true,
    });

    cy.wait(1000);

    cy.contains('ui5-table-row', Cypress.env('NAMESPACE_NAME')).contains(
      '.status-badge',
      'Terminating',
    );
  });

  it(
    'Check if the Namespace is terminated (step 2)',
    {
      retries: {
        runMode: 3,
        openMode: 3,
      },
      timeout: 200000,
    },
    () => {
      cy.getLeftNav().contains('Namespaces').click({ force: true });

      cy.get('ui5-table')
        .contains(Cypress.env('NAMESPACE_NAME'), { timeout: 180_000 })
        .should('not.exist');
    },
  );
});
