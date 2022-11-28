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

    cy.getIframeBody()
      .contains('a', FUNCTION_RECEIVER_NAME)
      .filter(':visible', { log: false })
      .first()
      .click({ force: true });

    cy.getIframeBody()
      .find('[role="status"]')
      .contains(/running/i, { timeout: 60 * 1000 });
  });

  it('Create a Subscription', () => {
    cy.getIframeBody()
      .contains('a', 'Configuration')
      .click();

    cy.getIframeBody()
      .contains('button', 'Create Subscription')
      .click();

    cy.getIframeBody()
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Subscription name"]:visible')
      .clear()
      .type(`${FUNCTION_RECEIVER_NAME}-subscription`);

    cy.getIframeBody()
      .contains('Choose Service for the sink')
      .click();

    cy.getIframeBody()
      .find('[role="option"]')
      .contains(FUNCTION_RECEIVER_NAME)
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the event type, for example, sap.kyma.custom.test-app.order.cancelled.v1"]',
      )
      .clear()
      .type('sap.kyma.custom.nonexistingapp.order.created.v1');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Go to details of the publisher Function', () => {
    cy.getLeftNav()
      .contains('Functions')
      .click();

    cy.getIframeBody()
      .contains('a', API_RULE_AND_FUNCTION_NAME)
      .filter(':visible', { log: false })
      .first()
      .click({ force: true });

    cy.getIframeBody()
      .find('[role="status"]')
      .contains(/running/i, { timeout: 60 * 1000 });
  });

  it('Create an API Rule for the publisher Function', () => {
    cy.createApiRule(
      API_RULE_AND_FUNCTION_NAME,
      API_RULE_PORT_NUMBER,
      API_RULE_SUBDOMAIN,
    );

    cy.wait(500);

    cy.getIframeBody()
      .find('[role="status"]:visible')
      .first()
      .should('have.text', 'OK');
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

  it('Check logs after triggering publisher function', () => {
    cy.navigateTo('Workloads', 'Functions');

    cy.getIframeBody()
      .contains('a', API_RULE_AND_FUNCTION_NAME)
      .click();

    cy.getIframeBody()
      .contains(`${API_RULE_AND_FUNCTION_NAME}-`)
      .then(element => {
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

    cy.getIframeBody()
      .contains('a', FUNCTION_RECEIVER_NAME)
      .click();

    cy.getIframeBody()
      .contains(`${FUNCTION_RECEIVER_NAME}-`)
      .then(element => {
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
    cy.navigateTo('Configuration', 'Subscriptions');

    cy.getIframeBody()
      .contains('Create Subscription')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Subscription name"]:visible')
      .clear()
      .type(`${API_RULE_AND_FUNCTION_NAME}-subscription`);

    cy.getIframeBody()
      .contains('Choose Service for the sink')
      .click();

    cy.getIframeBody()
      .contains(API_RULE_AND_FUNCTION_NAME)
      .click();

    cy.getIframeBody()
      .find('[placeholder="Choose Application name"]:visible')
      .clear()
      .type(Cypress.env('APP_NAME'))
      .click();

    cy.getIframeBody()
      .find('[placeholder="For example, order.cancelled"]:visible')
      .clear()
      .type('order.created');

    cy.getIframeBody()
      .find('[placeholder="For example, v1"]:visible')
      .clear()
      .type('v1')
      .click();

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
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

  it('Edit Subscription', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find(
        '[placeholder="Enter the event type, for example, sap.kyma.custom.test-app.order.cancelled.v1"]',
      )
      .clear()
      .type(`sap.kyma.custom.${Cypress.env('APP_NAME')}.order.canceled.v2`);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Update')
      .click();
  });

  it('Checking updates', () => {
    cy.getIframeBody()
      .contains('in-cluster-eventing-publisher-subscription')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Subscription active')
      .should('be.visible');

    cy.getIframeBody()
      .contains(/ready/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains('order.canceled.v2')
      .should('be.visible');
  });

  it('Inspect Subscription list', () => {
    cy.inspectList(
      'Subscriptions',
      `${API_RULE_AND_FUNCTION_NAME}-subscription`,
    );
  });
});
