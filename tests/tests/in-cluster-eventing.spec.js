/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';
const NAMESPACE_NAME = config.namespace;

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_NAME = 'in-cluster-eventing-receiver';

const API_RULE_AND_FUNCTION_NAME = 'in-cluster-eventing-publisher';
const API_RULE_HOST = API_RULE_AND_FUNCTION_NAME + '-' + random;
const API_RULE_HOST_EXPECTED_PREFIX = `https://${API_RULE_HOST}.`;

context('Busola - In-cluster eventing flow', () => {
  it('Create a Receiver Function', () => {
    cy.createFunction(
      FUNCTION_NAME,
      'fixtures/in-cluster-eventing-receiver.js',
      'fixtures/in-cluster-eventing-receiver-dependencies.json',
    );
  });

  it('Create an Event Subscriptions', () => {
    cy.getIframeBody()
      .contains('a', 'Configuration')
      .click();

    cy.getIframeBody()
      .contains('button', 'Add Event Subscription')
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="The eventType value used to create the subscription"]',
      )
      .type('nonexistingapp.order.created.v1');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Add')
      .click();
  });

  let apiRuleUrl;
  it('Create a publisher Function', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.createFunction(
      API_RULE_AND_FUNCTION_NAME,
      'fixtures/in-cluster-eventing-publisher.js',
      'fixtures/in-cluster-eventing-publisher-dependencies.json',
    );
  });

  it('Create an API Rule for the publisher Function', () => {
    cy.createApiRule(API_RULE_AND_FUNCTION_NAME, API_RULE_HOST);
  });

  it('Get Host value for the API Rule', () => {
    cy.getLeftNav()
      .contains('API Rules')
      .click();

    cy.getIframeBody()
      .find('tbody>tr')
      .within($tr => {
        cy.get('[role="status"]', { timeout: 60 * 1000 }).should(
          'have.text',
          'OK',
        );
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
        expect(response.body).to.eq('');
      },
    );
  });
});
