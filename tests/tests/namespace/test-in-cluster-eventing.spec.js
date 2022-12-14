/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const random = Math.floor(Math.random() * 9999) + 1000;
const FUNCTION_RECEIVER_NAME = 'in-cluster-eventing-receiver';
const API_RULE_AND_FUNCTION_NAME = 'in-cluster-eventing-publisher';
const API_RULE_SUBDOMAIN = API_RULE_AND_FUNCTION_NAME + '-' + random;
const API_RULE_PORT_NUMBER = 80;
const API_RULE_HOST_EXPECTED_PREFIX = `https://${API_RULE_SUBDOMAIN}.`;

context('Test in-cluster eventing', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions([
      'examples/resources/gateway/apirules.yaml',
      'examples/resources/serverless/functions.yaml',
    ]);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Go to details of the receiver Function', () => {
    cy.navigateTo('Workloads', 'Functions');

    cy.contains('a', FUNCTION_RECEIVER_NAME)
      .filter(':visible', { log: false })
      .first()
      .click({ force: true });

    cy.get('[role="status"]').contains(/running/i, { timeout: 60 * 1000 });
  });

  it('Create a Subscription', () => {
    cy.navigateTo('Configuration', 'Subscriptions');

    cy.contains('button', 'Create Subscription').click();

    cy.contains('Advanced').click();

    cy.get('[ariaLabel="Subscription name"]:visible')
      .clear()
      .type(`${FUNCTION_RECEIVER_NAME}-subscription`);

    cy.contains('Choose Service for the sink').click();

    cy.get('[role="option"]')
      .contains(FUNCTION_RECEIVER_NAME)
      .click();

    cy.get(
      '[placeholder="Enter the event type, for example, sap.kyma.custom.test-app.order.cancelled.v1"]',
    )
      .clear()
      .type('sap.kyma.custom.nonexistingapp.order.created.v1');

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Go to details of the publisher Function', () => {
    cy.getLeftNav()
      .contains('Functions')
      .click();

    cy.contains('a', API_RULE_AND_FUNCTION_NAME)
      .filter(':visible', { log: false })
      .first()
      .click({ force: true });

    cy.get('[role="status"]').contains(/running/i, { timeout: 60 * 1000 });
  });

  it('Create an API Rule for the publisher Function', () => {
    cy.createApiRule(
      API_RULE_AND_FUNCTION_NAME,
      API_RULE_PORT_NUMBER,
      API_RULE_SUBDOMAIN,
    );

    cy.wait(500);

    cy.get('[role="status"]:visible')
      .first()
      .should('have.text', 'OK');
  });

  let apiRuleHost;
  it('Get Host value for the API Rule', () => {
    cy.checkApiRuleStatus(API_RULE_AND_FUNCTION_NAME);

    cy.get('tbody>tr').within($tr => {
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

  it('Check logs after triggering publisher function', () => {
    cy.getLeftNav()
      .contains('Functions')
      .click();

    cy.contains('a', API_RULE_AND_FUNCTION_NAME).click();

    cy.contains(`${API_RULE_AND_FUNCTION_NAME}-`).then(element => {
      const podName = element[0].textContent;
      loadFile('kubeconfig.yaml').then(kubeconfig => {
        const requestUrl = `/api/v1/namespaces/${Cypress.env(
          'NAMESPACE_NAME',
        )}/pods/${podName}/log?container=function`;
        cy.request({
          method: 'GET',
          url: kubeconfig.clusters[0].cluster.server + requestUrl,
          timeout: 10000,
          headers: {
            authorization: 'Bearer ' + kubeconfig.users[0].user.token,
          },
        }).then(response => {
          // response.body is automatically serialized into JSON
          expect(response.body).to.match(/^Payload/);
        });
      });
    });
  });

  it('Check logs for receiver function', () => {
    cy.getLeftNav()
      .contains('Functions')
      .click();

    cy.contains('a', FUNCTION_RECEIVER_NAME).click();

    cy.contains(`${FUNCTION_RECEIVER_NAME}-`).then(element => {
      const podName = element[0].textContent;
      loadFile('kubeconfig.yaml').then(kubeconfig => {
        const requestUrl = `/api/v1/namespaces/${Cypress.env(
          'NAMESPACE_NAME',
        )}/pods/${podName}/log?container=function`;
        cy.request({
          method: 'GET',
          url: kubeconfig.clusters[0].cluster.server + requestUrl,
          timeout: 10000,
          headers: {
            authorization: 'Bearer ' + kubeconfig.users[0].user.token,
          },
        }).then(response => {
          // response.body is automatically serialized into JSON
          expect(response.body).to.match(/^Event received/);
        });
      });
    });
  });

  it('Create Subscription', () => {
    cy.getLeftNav()
      .contains('Subscriptions')
      .click();

    cy.contains('Create Subscription').click();

    cy.get('[ariaLabel="Subscription name"]:visible')
      .clear()
      .type(`${API_RULE_AND_FUNCTION_NAME}-subscription`);

    cy.contains('Choose Service for the sink').click();

    cy.contains(API_RULE_AND_FUNCTION_NAME).click();

    cy.get('[placeholder="Choose Application name"]:visible')
      .clear()
      .type(Cypress.env('APP_NAME'))
      .click();

    cy.get('[placeholder="For example, order.cancelled"]:visible')
      .clear()
      .type('order.created');

    cy.get('[placeholder="For example, v1"]:visible')
      .clear()
      .type('v1')
      .click();

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.contains('in-cluster-eventing-publisher-subscription').should(
      'be.visible',
    );

    cy.contains('Subscription active').should('be.visible');

    cy.contains(/ready/i).should('be.visible');
  });

  it('Edit Subscription', () => {
    cy.contains('Edit').click();

    cy.get(
      '[placeholder="Enter the event type, for example, sap.kyma.custom.test-app.order.cancelled.v1"]',
    )
      .clear()
      .type(`sap.kyma.custom.${Cypress.env('APP_NAME')}.order.canceled.v2`);

    cy.get('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updates', () => {
    cy.contains('in-cluster-eventing-publisher-subscription').should(
      'be.visible',
    );

    cy.contains('Subscription active').should('be.visible');

    cy.contains(/ready/i).should('be.visible');

    cy.contains('order.canceled.v2').should('be.visible');
  });

  it('Inspect Subscription list', () => {
    cy.inspectList(
      'Subscriptions',
      `${API_RULE_AND_FUNCTION_NAME}-subscription`,
    );
  });
});
