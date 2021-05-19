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
const API_RULE_NAME = 'orders-function';
const API_RULE_HOST = API_RULE_NAME + '-' + random;
const API_RULE_HOST_EXPECTED_PREFIX = `https://${API_RULE_HOST}.`;

context('Busola - Create a Function and access it', () => {
  let apiRuleUrl;
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
      .should('not.be.disabled')
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

    cy.getIframeBody()
      .find('.lambda-details')
      .contains('button', 'Save')
      .should('not.be.disabled')
      .click();

    //TODO use one namespace per all tests. Then we'll be able create the lambda at the beginning and create API Rule for it at the end
    cy.getIframeBody()
      .find('[role="status"]', { timeout: 90 * 1000 })
      .should('have.text', 'RUNNING');
  });

  it('Create an API Rule for the Function', () => {
    getLeftNav()
      .contains('Discovery and Network')
      .click();

    getLeftNav()
      .contains('API Rules')
      .click();

    cy.getIframeBody()
      .contains('Create apirules')
      .click();

    cy.getModalBody().within($modal => {
      cy.get('[placeholder="API Rule name"]').type(API_RULE_NAME);
      cy.get('[placeholder="Enter the hostname"]').type(API_RULE_HOST); //the host is ocupied by another virtualservice
      cy.get('[role="select"]#service').select(API_RULE_NAME + ':80');

      cy.get('[aria-label="Access strategy type"]').select('noop');

      // inputs are invisible because the Fundamental uses label::before to display the check area
      cy.get('input[type="checkbox"]').check(['GET', 'POST'], { force: true });
      cy.get('input[type="checkbox"]').uncheck(
        ['PUT', 'PATCH', 'DELETE', 'HEAD'],
        { force: true },
      );
      cy.get('[aria-label="submit-form"]')
        .should('not.be.disabled')
        .click();
    });

    cy.getModalBody().should('not.exist');
  });

  it('Get Host value for the API Rule', () => {
    getLeftNav()
      .contains('API Rules')
      .click();

    cy.getIframeBody()
      .find('tbody>tr')
      .within($tr => {
        cy.get('[role="status"]').should('have.text', 'OK');
        cy.get(`a[href^="${API_RULE_HOST_EXPECTED_PREFIX}"]`)
          .should('exist')
          .then($link => {
            apiRuleUrl = $link.attr('href');
            cy.log('api rule host set to ', apiRuleUrl);
          });
      });
  });

  it('Make a request to the Function', () => {
    assert.exists(apiRuleUrl, 'the "apiRuleUrl" variable is defined');
    assert.notEqual(
      apiRuleUrl,
      API_RULE_HOST_EXPECTED_PREFIX,
      'the "apiRuleUrl" variable is not equal',
    );

    cy.request({ method: 'GET', url: apiRuleUrl, timeout: 10000 }).then(
      response => {
        // response.body is automatically serialized into JSON
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.eq(0);
      },
    );
  });

  it('Delete the namespace (cleanup step 1)', () => {
    getLeftNav()
      .contains('Namespaces') //it finds Namespaces (expected) or Back to Namespaces (if tests fail in the middle)
      .click({ force: true }); //we need to use force when others elements make menu not visible

    cy.getIframeBody()
      .find('[role="search"] [aria-label="search-input"]')
      .type(NAMESPACE_NAME, { force: true }); // use force to skip clicking (the table could re-render between the click and the typing)

    cy.getIframeBody()
      .find('tbody tr [aria-label="Delete"]')
      .click({ force: true });
  });

  it(
    'Check if the namespace is terminated (cleanup step 2)',
    { retries: 3 },
    () => {
      cy.getIframeBody()
        .find('tbody tr [role="status"]')
        .should('have.text', 'TERMINATING');
    },
  );
});
