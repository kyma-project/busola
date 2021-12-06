import config from '../config';

Cypress.Commands.add(
  'loginAndSelectCluster',
  (fileName = 'kubeconfig.yaml') => {
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

    cy.getIframeBody()
      .contains('Connect a cluster')
      .click();

    cy.url().should('match', /namespaces$/);
    cy.getIframeBody()
      .find('thead')
      .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.

    return cy.end();
  },
);
