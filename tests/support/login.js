import config from '../config';
const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const NAMESPACE_NAME = config.namespace;

before(() => {
  cy.visit(ADDRESS)
    .getIframeBody()
    .contains('Add Cluster')
    .click();

  cy.getIframeBody()
    .contains('Drag file here')
    .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

  cy.getIframeBody()
    .find('[role=alert]')
    .should('not.exist');
  cy.url().should('match', /namespaces$/);
  cy.getIframeBody()
    .find('thead')
    .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.

  cy.getIframeBody()
    .contains('Create Namespace')
    .click();

  cy.getIframeBody()
    .find('[role=dialog]')
    .find("input[placeholder='Namespace name']")
    .should('be.visible')
    .type(NAMESPACE_NAME);

  cy.getIframeBody()
    .find('[role=dialog]')
    .contains('button', 'Create')
    .click();

  // Go to the details of namespace
  cy.getIframeBody()
    .contains('a', NAMESPACE_NAME)
    .click();
});

beforeEach(() => {
  cy.restoreLocalStorageCache();
});

afterEach(() => {
  cy.saveLocalStorageCache();
});
