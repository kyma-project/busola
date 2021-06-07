/// <reference types="cypress" />
import 'cypress-file-upload';

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_CODE_URL =
  'https://raw.githubusercontent.com/kyma-project/examples/main/orders-service/function/handler.js';
const API_RULE_NAME = 'orders-function';
const API_RULE_HOST = API_RULE_NAME + '-' + random;
const API_RULE_HOST_EXPECTED_PREFIX = `https://${API_RULE_HOST}.`;

context('Create a Function and access it', () => {
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
    cy.createFunction(
      API_RULE_NAME,
      'fixtures/orders-function.js',
      'fixtures/orders-function-dependencies.json',
    );
  });

  it('Create an API Rule for the Function', () => {
    cy.createApiRule(API_RULE_NAME, API_RULE_HOST);
  });

  let apiRuleHost;
  it('Get Host value for the API Rule', () => {
    cy.checkApiRuleStatus(API_RULE_NAME);

    cy.getIframeBody()
      .find('tbody>tr')
      .within($tr => {
        cy.get(`a[href^="${API_RULE_HOST_EXPECTED_PREFIX}"]`)
          .should('exist')
          .then($link => {
            apiRuleHost = $link.attr('href');
            cy.log('api rule host set to ', apiRuleHost);
          });
      });
  });

  it('Make a request to the Function', () => {
    assert.exists(apiRuleHost, 'the "apiRuleHost" variable is defined');
    assert.notEqual(
      apiRuleHost,
      API_RULE_HOST_EXPECTED_PREFIX,
      'the "apiRuleHost" variable is not equal',
    );

    cy.request({ method: 'GET', url: apiRuleHost, timeout: 10000 }).then(
      response => {
        // response.body is automatically serialized into JSON
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.eq(0);
      },
    );
  });
});
