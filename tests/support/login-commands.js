import config from '../config';

Cypress.Commands.add('loginAndSelectCluster', params => {
  const defaults = {
    fileName: 'kubeconfig.yaml',
    expectedLocation: /overview$/,
    storage: null,
  };
  const { fileName, expectedLocation, storage } = { ...defaults, ...params };

  cy.visit(`${config.clusterAddress}/clusters`)
    .getIframeBody()
    .contains('Connect a cluster')
    .click();

  cy.getIframeBody()
    .contains('Drag file here')
    .attachFile(fileName, { subjectType: 'drag-n-drop' });

  cy.getIframeBody()
    .contains('Next')
    .click();

  if (storage) {
    cy.getIframeBody()
      .contains(storage)
      .click();
  }

  cy.getIframeBody()
    .find('[role="dialog"]')
    .contains('button', 'Connect a cluster')
    .click();

  cy.url().should('match', expectedLocation);
  cy.getIframeBody()
    .find('thead')
    .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.

  return cy.end();
});
