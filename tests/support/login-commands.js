import config from '../config';

const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');
Cypress.Commands.add('loginAndSelectCluster', () => {
  cy.visit(config.clusterAddress)
    .getIframeBody()
    .contains('Add Cluster')
    .click();

  cy.getIframeBody()
    .contains('Drag file here')
    .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

  cy.getIframeBody()
    .find('[role=alert]')
    .should('not.exist');

  cy.wait(5000); //it freezes locally - we need to find a better solution
  getLeftNav()
    .contains('Namespaces')
    .click();

  cy.url().should('match', /namespaces$/);
  cy.getIframeBody()
    .find('thead')
    .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.

  return cy.end();
});

Cypress.Commands.add('handleInvalidLoginData', () => {
  const loginErrorAlert = Cypress.$('#error');
  if (loginErrorAlert.length !== 0) {
    throw Error(`Login failed with message: ${loginErrorAlert.text()}`);
  }
  return cy.end();
});
