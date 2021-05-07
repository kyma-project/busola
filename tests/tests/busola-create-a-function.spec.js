/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const random = Math.floor(Math.random() * 1000);
const NAMESPACE_NAME = `a-busola-test-${random}`;

context('Busola - Create a Function', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  before(() => {
    cy.visit(ADDRESS)
      .contains('Drag file here')
      .attachFile('kubeconfig.yaml', { subjectType: 'drag-n-drop' });

    cy.get('#error').should('not.exist');
    cy.url().should('eq', ADDRESS + '/home/workspace');
    cy.getIframeBody()
      .find('thead')
      .should('be.visible'); //wait for the namespaces XHR request to finish to continue running the tests. There's no <thead> while the request is pending.
  });

  after(() => {
    getLeftNav()
      .contains('Namespaces') //it finds Namespaces (expected) or Back to Namespaces (if tests fail in the middle)
      .click({ force: true }); //we need to use force when others elements make menu not visible

    cy.wait(1000);

    cy.getIframeBody()
      .find('[aria-label="open-search"]')
      .click({ force: true });

    cy.wait(1000);

    cy.getIframeBody()
      .find('input[placeholder="Search"]')
      .type(NAMESPACE_NAME);

    cy.wait(1000);

    cy.getIframeBody()
      .find('[aria-label="Delete"]')
      .click({ force: true });

    cy.wait(5000);

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

  it('Create a new namespace', () => {
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
  });

  it('Go to the details of namespace', () => {
    cy.getIframeBody()
      .contains('a', NAMESPACE_NAME)
      .click();
  });

  it('Create a Function', () => {
    cy.getIframeBody()
      .contains('Deploy new workload')
      .click();

    cy.getIframeBody()
      .find('[role="menu"]')
      .contains('Create Function')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Function name"]')
      .clear()
      .type('orders-function');

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type('app=orders-function');

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter Labels key=value"]')
      .type('example=orders-function');

    cy.getIframeBody()
      .contains('label', 'Labels')
      .click();

    cy.getIframeBody()
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .find('div[role="code"]')
      .find('.monaco-editor')
      .clear()
      .type(cy.readFile('fixtures/handler.js'));
  });
});
