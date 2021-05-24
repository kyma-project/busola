/// <reference types="cypress" />
import 'cypress-file-upload';

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_CODE_URL =
  'https://raw.githubusercontent.com/kyma-project/examples/main/orders-service/function/handler.js';
const API_RULE_AND_FUNCTION_NAME = 'orders-function';
const API_RULE_HOST = API_RULE_AND_FUNCTION_NAME + '-' + random;
const API_RULE_HOST_EXPECTED_PREFIX = `https://${API_RULE_HOST}.`;

context('Busola - Create a Function and access it', () => {
  let apiRuleUrl;

  before(() => {
    cy.request({
      url: FUNCTION_CODE_URL,
    }).then(response => {
      cy.log('Downloaded the Function code');
      cy.writeFile('fixtures/orders-function.js', response.body);
    });
  });

  it('Create a Function', () => {
    cy.createFunction(
      API_RULE_AND_FUNCTION_NAME,
      'fixtures/orders-function.js',
      'fixtures/orders-function-dependencies.json',
    );
  });

  it('Create an API Rule for the Function', () => {
    cy.createApiRule(API_RULE_AND_FUNCTION_NAME, API_RULE_HOST);
  });

  it('Get Host value for the API Rule', () => {
    cy.getIframeBody()
      .find('[role="status"]')
      .should('have.text', 'OK');

    cy.getIframeBody()
      .find('tbody>tr')
      .within($tr => {
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
