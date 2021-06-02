/// <reference types='cypress' />

const path = require('path');
const downloadsFolder = Cypress.config('downloadsFolder');
const kubeconfigPath = path.join(downloadsFolder, 'kubeconfig.yaml');

context('Download a Kubeconfig', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Download a Kubeconfig from the top nav', () => {
    cy.readFile(kubeconfigPath).should('not.exist');
    cy.get('[data-testid=luigi-topnav-profile]').click();
    cy.get('[data-testid=downloadcurrentclusterkubeconfig]').click();

    cy.readFile(kubeconfigPath).should('exist');
    cy.task('removeFile', kubeconfigPath);
  });

  it('Download a Kubeconfig from the Clusters list', () => {
    cy.readFile(kubeconfigPath).should('not.exist');
    cy.get('[data-testid=app-switcher]').click();
    cy.get('[data-testid=clustersoverview]').click();
    cy.getIframeBody()
      .find('[data-testid=downloadkubeconfig]')
      .click({ force: true });

    cy.readFile(kubeconfigPath).should('exist');
    cy.task('removeFile', kubeconfigPath);
  });
});
