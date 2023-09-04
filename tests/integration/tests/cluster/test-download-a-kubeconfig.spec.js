/// <reference types='cypress' />

const path = require('path');

const DOWNLOADS_FOLDER = Cypress.config('downloadsFolder');

context('Test Download a Kubeconfig', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Download a Kubeconfig from the Clusters list', () => {
    cy.changeCluster('all-clusters');

    cy.get('ui5-table-cell')
      .eq(0)
      .then(el => {
        const contextName = el.text();

        const filepath = path.join(
          DOWNLOADS_FOLDER,
          `kubeconfig--${contextName}.yaml`,
        );

        cy.readFile(filepath).should('not.exist');

        cy.get('[data-testid=downloadkubeconfig]').click({ force: true });

        cy.readFile(filepath).should('exist');
        cy.task('removeFile', filepath);
      });
  });
});
