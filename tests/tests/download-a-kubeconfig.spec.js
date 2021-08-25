/// <reference types='cypress' />

const path = require('path');

const DOWNLOADS_FOLDER = Cypress.config('downloadsFolder');
const KUBECONFIG_PATH = path.join(DOWNLOADS_FOLDER, 'kubeconfig.yaml');

context('Download a Kubeconfig', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Download a Kubeconfig from the top nav', () => {
    cy.readFile(KUBECONFIG_PATH).should('not.exist');
    cy.get('[data-testid=luigi-topnav-profile]').click();
    cy.get('[data-testid=downloadcurrentclusterkubeconfig]').click();

    cy.readFile(KUBECONFIG_PATH).should('exist');
    cy.task('removeFile', KUBECONFIG_PATH);
  });

  it('Download a Kubeconfig from the Clusters list', () => {
    cy.readFile(KUBECONFIG_PATH).should('not.exist');
    cy.get('[data-testid=app-switcher]').click();
    cy.get('[data-testid=clustersoverview]').click();
    cy.getIframeBody()
      .find('[data-testid=downloadkubeconfig]')
      .click({ force: true });

    cy.readFile(KUBECONFIG_PATH).should('exist');
    cy.task('removeFile', KUBECONFIG_PATH);
  });
});
