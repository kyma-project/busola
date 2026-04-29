/// <reference types="cypress" />
import 'cypress-file-upload';

context('Clean up Namespace', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Delete the Namespace (step 1)', () => {
    cy.getLeftNav().contains('Namespaces').click();

    cy.wait(1000);

    cy.deleteFromGenericList('Namespace', Cypress.env('NAMESPACE_NAME'), {
      clearSearch: false,
      checkIfResourceIsRemoved: false,
      selectSearchResult: true,
      searchInPlainTableText: true,
    });

    cy.get('ui5-table-row').find('.status-badge').contains('Terminating');
  });

  it(
    'Force remove finalizers if namespace is stuck terminating (step 2)',
    { timeout: 60000 },
    () => {
      const ns = Cypress.env('NAMESPACE_NAME');
      cy.exec(
        `kubectl get ns ${ns} --ignore-not-found -o jsonpath='{.metadata.finalizers}'`,
        { failOnNonZeroExit: false, timeout: 15000 },
      ).then((result) => {
        if (result.stdout && result.stdout !== '[]') {
          cy.exec(
            `kubectl patch ns ${ns} --type=merge -p '{"metadata":{"finalizers":[]}}'`,
            { failOnNonZeroExit: false, timeout: 15000 },
          );
        }
      });
    },
  );

  it(
    'Check if the Namespace is terminated (step 3)',
    {
      retries: {
        runMode: 3,
        openMode: 3,
      },
      timeout: 200000,
    },
    () => {
      cy.getLeftNav().contains('Namespaces').click();

      cy.get('ui5-table')
        .contains(Cypress.env('NAMESPACE_NAME'), { timeout: 180_000 })
        .should('not.exist');
    },
  );
});
