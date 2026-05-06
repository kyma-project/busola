/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Namespace', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Delete the Namespace (step 1)', () => {
    cy.getLeftNav().contains('Namespaces').click();

    cy.wait(2000);

    cy.deleteFromGenericList('Namespace', Cypress.env('NAMESPACE_NAME'), {
      clearSearch: false,
      checkIfResourceIsRemoved: false,
      selectSearchResult: true,
      searchInPlainTableText: true,
    });
  });

  it('Check if the Namespace is terminating (step 2)', () => {
    cy.get('ui5-table-row').find('.status-badge').contains('Terminating');
  });
});
