import config from '../config';
const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const NAMESPACE_NAME = config.namespace;
const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

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

  cy.wait(3000);

  // Create a new namespace
  getLeftNav()
    .contains('Namespaces')
    .click();

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
  cy.wait(1000);

  // Go to the details of namespace
  cy.getIframeBody()
    .contains('a', NAMESPACE_NAME)
    .click({ force: true });
});

after(() => {
  cy.get('[data-testid=luigi-topnav-logo]').click({ force: true }); //we need to use force when others elements make menu not visible

  cy.wait(1000);
  cy.getIframeBody()
    .find('[aria-label="open-search"]')
    .click({ force: true });

  cy.wait(1000);
  cy.getIframeBody()
    .find('[placeholder="Search"]')
    .type(NAMESPACE_NAME);

  cy.wait(1000);
  cy.getIframeBody()
    .find('[aria-label="Delete"]')
    .click({ force: true });

  cy.getIframeBody()
    .find('[role="status"]')
    .should('have.text', 'TERMINATING');
});

beforeEach(() => {
  cy.restoreLocalStorageCache();
});

afterEach(() => {
  cy.saveLocalStorageCache();
});
