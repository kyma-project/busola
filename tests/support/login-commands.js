import config from '../config';

Cypress.Commands.add('loginAndSelectCluster', () => {
  cy.visit(`${config.clusterAddress}/clusters`)
    .getIframeBody()
    .contains('Add a Cluster')
    .click();

  cy.getIframeBody()
    .contains('Drag file here')
    .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

  cy.getIframeBody()
    .contains('Next Step')
    .click();

  cy.getIframeBody().then($body => {
    //OIDC login flow
    if ($body.find('span[role="presentation"]').length > 0) {
      cy.getIframeBody()
        .find('span[role="presentation"]')
        .click();

      cy.getIframeBody()
        .find('input[aria-label="issuer-url"]')
        .type('https://kymatest.accounts400.ondemand.com');

      cy.getIframeBody()
        .find('input[aria-label="client-id"]')
        .type('9bd05ed7-a930-44e6-8c79-e6defeb7dec9');

      cy.getIframeBody()
        .find('input[aria-label="scopes"]')
        .type('openid');

      cy.getIframeBody()
        .contains('Next Step')
        .click();
    }
  });

  cy.getIframeBody()
    .contains('Add Cluster')
    .click();

  cy.url().should('match', /namespaces$/);
  cy.getIframeBody()
    .find('thead')
    .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.

  return cy.end();
});
