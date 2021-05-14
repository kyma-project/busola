/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';

const ADDRESS = config.localDev
  ? `http://localhost:4200`
  : `https://busola.${config.domain}`;

const random = Math.floor(Math.random() * 9999) + 1000;
const NAMESPACE_NAME = `a-busola-test-${random}`;
const FUNCTION_CODE_URL =
  'https://raw.githubusercontent.com/kyma-project/examples/main/orders-service/function/handler.js';
const API_RULE_HOST_PREFIX = `https://orders-function-host.`;

context('Busola - Create a Function', () => {
  const getLeftNav = () => cy.get('nav[data-testid=semiCollapsibleLeftNav]');

  before(() => {
    cy.request({
      url: FUNCTION_CODE_URL,
    }).then(response => {
      cy.log('Downloaded the Function code');
      cy.writeFile('fixtures/orders-function.js', response.body);
    });

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
  });

  after(() => {
    getLeftNav()
      .contains('Namespaces') //it finds Namespaces (expected) or Back to Namespaces (if tests fail in the middle)
      .click({ force: true }); //we need to use force when others elements make menu not visible

    cy.wait(3000);
    // cy.get();

    cy.getIframeBody()
      .find('[aria-label="open-search"]')
      .click({ force: true });
    cy.wait(1000);

    cy.getIframeBody()
      .find('[role=search][aria-expanded="true"]')
      .find('input[placeholder = "Search"]')
      .type(NAMESPACE_NAME);

    cy.wait(1000);
    cy.getIframeBody()
      .find('[aria-label="Delete"]')
      .click({ force: true });

    cy.getIframeBody()
      .find('[role="status"]')
      .contains('TERMINATING');
  });

  beforeEach(() => {
    cy.restoreLocalStorageCache();
  });

  afterEach(() => {
    cy.saveLocalStorageCache();
  });

  it('Create a new namespace', () => {
    cy.wait(3000);
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
    getLeftNav()
      .contains('Workloads')
      .click();

    getLeftNav()
      .contains('Functions')
      .click();

    cy.getIframeBody()
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
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.wait(3000);
    cy.readFile('fixtures/orders-function.js').then(body => {
      cy.getIframeBody()
        .find('textarea[aria-roledescription="editor"]')
        .filter(':visible')
        .clear()
        .paste({
          pastePayload: body,
        });
    });

    cy.getIframeBody()
      .find('[aria-controls="function-dependencies"]')
      .click();

    cy.readFile('fixtures/orders-function-dependencies.json').then(body => {
      cy.getIframeBody()
        .find('textarea[aria-roledescription="editor"]')
        .filter(':visible')
        .clear()
        .paste({
          pastePayload: JSON.stringify(body),
        });
    });

    // cy.wait(1000);
    cy.getIframeBody()
      .find('.lambda-details')
      .contains('button', 'Save')
      .should('not.be.disabled')
      .click();

    //TODO use one namespace per all tests. Then we'll be able create the lambda at the beginning and create API Rule for it at the end
    cy.getIframeBody()
      .find('[role="status"]', { timeout: 60000 })
      .should('have.text', 'RUNNING');
  });

  it('Create API Rule for the Function', () => {
    getLeftNav()
      .contains('Discovery and Network')
      .click();

    getLeftNav()
      .contains('API Rules')
      .click();

    cy.getIframeBody()
      .contains('Create apirules')
      .click();

    // cy.wait(2000);

    cy.getModalBody().within($modal => {
      cy.get('[placeholder="API Rule name"]').type('orders-function');
      cy.get('[placeholder="Enter the hostname"]').type('orders-function-host'); //the host is ocupied by another virtualservice
      cy.get('[role="select"]#service').select('orders-function:80');

      cy.get('[aria-label="Access strategy type"]').select('noop');

      // cy.wait(10000);
      // inputs are invisible because the Fundamental uses label::before to display the check area
      cy.get('input[type="checkbox"]').check(['GET', 'POST'], { force: true });
      cy.get('input[type="checkbox"]').uncheck(
        ['PUT', 'PATCH', 'DELETE', 'HEAD'],
        { force: true },
      );
      cy.get('[aria-label="submit-form"]')
        // .contains('button', 'Create')
        .should('not.be.disabled')
        .click();
    });
  });

  it('Check Host value for the API Rule', () => {
    getLeftNav()
      .contains('API Rules')
      .click();

    cy.getIframeBody()
      .find('tbody>tr')
      .find(`a[href^="${API_RULE_HOST_PREFIX}"]`)
      .should('exist');
  });
});
