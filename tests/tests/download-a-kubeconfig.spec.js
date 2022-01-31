/// <reference types='cypress' />

const path = require('path');

const DOWNLOADS_FOLDER = Cypress.config('downloadsFolder');
const KUBECONFIG_PATH = path.join(DOWNLOADS_FOLDER, 'kubeconfig.yaml');

context('Download a Kubeconfig', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Download a Kubeconfig from the Clusters list', () => {
    cy.readFile(KUBECONFIG_PATH).should('not.exist');
    cy.get('[data-testid=app-switcher]').click();
    cy.get('[data-testid=clusters-overview]').click();
    cy.getIframeBody()
      .find('[data-testid=downloadkubeconfig]')
      .click({ force: true });

    cy.readFile(KUBECONFIG_PATH).should('exist');
    cy.task('removeFile', KUBECONFIG_PATH);
  });
});
