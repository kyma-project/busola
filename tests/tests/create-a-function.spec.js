/// <reference types="cypress" />
import 'cypress-file-upload';

const random = Math.floor(Math.random() * 9999) + 1000;
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
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
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

    cy.getIframeBody()
      .find('[role="status"]', { timeout: 60 * 1000 })
      .should('have.text', 'DEPLOYING');

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
      .find('[role="status"]', { timeout: 60 * 1000 })
      .should('have.text', 'DEPLOYING');

    cy.getIframeBody()
      .find('[role="status"]', { timeout: 120 * 1000 })
      .should('have.text', 'RUNNING');
  });

  it('Create an API Rule for the Function', () => {
    getLeftNav()
      .contains('API Rules')
      .click({ force: true });

    cy.getIframeBody()
      .contains('Create apirules')
      .should('be.visible')
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
    cy.get('.iframeModalCtn iframe').should('not.exist');
  });

  it('Get Host value for the API Rule', () => {
    getLeftNav()
      .contains('API Rules')
      .click({ force: true });

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
});
