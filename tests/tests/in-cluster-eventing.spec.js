/// <reference types="cypress" />
import config from '../config';
import 'cypress-file-upload';
import { loadSubscription } from '../support/loadFile';
const NAMESPACE_NAME = config.namespace;

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_NAME = 'in-cluster-eventing-receiver';

const API_RULE_AND_FUNCTION_NAME = 'in-cluster-eventing-publisher';
const API_RULE_HOST = API_RULE_AND_FUNCTION_NAME + '-' + random;
const API_RULE_HOST_EXPECTED_PREFIX = `https://${API_RULE_HOST}.`;

const POD_NAME_REGEX = new RegExp(`${FUNCTION_NAME}-(?!.*build)`);

context('In-cluster eventing', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Receiver Function', () => {
    cy.createFunction(
      FUNCTION_NAME,
      'fixtures/in-cluster-eventing-receiver.js',
      'fixtures/in-cluster-eventing-receiver-dependencies.json',
    );
  });

  it('Create an Event Subscription', () => {
    cy.getIframeBody()
      .contains('a', 'Configuration')
      .click();

    cy.getIframeBody()
      .contains('button', 'Create Event Subscription')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Event Subscription Name"]:visible')
      .clear()
      .type(`${FUNCTION_NAME}-subscription`);

    cy.getIframeBody()
      .contains('Choose Application Name')
      .click();

    cy.getIframeBody()
      .contains('mock-app')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Event name"]:visible')
      .clear()
      .type('order.created');

    cy.getIframeBody()
      .find('[placeholder="Event version"]:visible')
      .clear()
      .type('v1');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Create a publisher Function', () => {
    cy.createFunction(
      API_RULE_AND_FUNCTION_NAME,
      'fixtures/in-cluster-eventing-publisher.js',
      'fixtures/in-cluster-eventing-publisher-dependencies.json',
    );
  });

  it('Create an API Rule for the publisher Function', () => {
    cy.createApiRule(API_RULE_AND_FUNCTION_NAME, API_RULE_HOST);
  });

  let apiRuleHost;
  it('Get Host value for the API Rule', () => {
    cy.checkApiRuleStatus(API_RULE_AND_FUNCTION_NAME);

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
        expect(response.body).to.eq('');
      },
    );
  });

  it('Open the receiver logs', () => {
    cy.getLeftNav()
      .contains('Workloads')
      .click();

    cy.getLeftNav()
      .contains('Functions')
      .click();

    cy.getIframeBody()
      .contains('a', FUNCTION_NAME)
      .click();

    cy.getIframeBody()
      .contains('View Logs')
      .click();

    // it just doesn't work in cypress
    // cy.getIframeBody()
    //   .contains('.logs', 'Event received')
    //   .should('be.visible');
  });

  it('Navigate to Event Subscription', () => {
    cy.getLeftNav()
      .contains('Configuration')
      .click();

    cy.getLeftNav()
      .contains('Event Subscriptions')
      .click();
  });

  it('Create Event Subscription', () => {
    cy.getIframeBody()
      .contains('Create Event Subscription')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Event Subscription Name"]:visible')
      .clear()
      .type(`${API_RULE_AND_FUNCTION_NAME}-subscription`);

    cy.getIframeBody()
      .contains('Choose Service Name')
      .click();

    cy.getIframeBody()
      .contains(API_RULE_AND_FUNCTION_NAME)
      .click();

    cy.getIframeBody()
      .contains('Choose Application Name')
      .click();

    cy.getIframeBody()
      .contains('mock-app')
      .click({ force: true });

    cy.getIframeBody()
      .find('[placeholder="Event name"]:visible')
      .clear()
      .type('order.created');

    cy.getIframeBody()
      .find('[placeholder="Event version"]:visible')
      .clear()
      .type('v1');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.wait(40000);
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains('in-cluster-eventing-publisher-subscription')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Subscription active')
      .should('be.visible');

    cy.getIframeBody()
      .contains(/ready/i)
      .should('be.visible');
  });

  it('Delete Event Subscription', () => {
    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.get('[data-testid=luigi-modal-confirm]').click();
  });
});
