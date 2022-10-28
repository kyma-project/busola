/// <reference types="cypress" />
import 'cypress-file-upload';

const GATEWAY_NAME =
  'test-gateway-' +
  Math.random()
    .toString()
    .substr(2, 8);

const SERVER_NAME = GATEWAY_NAME + '-server';
const TARGET_PORT = 8080;

const KYMA_GATEWAY_CERTS = 'kyma-gateway-certs';

context('Test Gateways', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create Gateway', () => {
    cy.navigateTo('Istio', 'Gateways');

    cy.getIframeBody()
      .contains('Create Gateway')
      .click();

    // name
    cy.getIframeBody()
      .find('[ariaLabel="Gateway name"]:visible', { log: false })
      .type(GATEWAY_NAME);

    // selector
    cy.getIframeBody()
      .find('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('selector-key');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    // server name
    cy.getIframeBody()
      .find('[ariaLabel^="Port name"]:visible', { log: false })
      .type(SERVER_NAME);

    // hosts
    cy.getIframeBody()
      .find('[ariaLabel^="Host"]:visible', { log: false })
      .type('example.com{downarrow}*.example.com');

    // server target port
    cy.getIframeBody()
      .find('[ariaLabel^="Target port"]:visible', { log: false })
      .type(TARGET_PORT);

    // create
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    // name
    cy.getIframeBody().contains(GATEWAY_NAME);
    // default selector
    cy.getIframeBody().contains('istio=ingressgateway');
    // selector
    cy.getIframeBody().contains('selector-key=selector-value');
    // port (and server)
    cy.getIframeBody().contains(`${SERVER_NAME} (80:${TARGET_PORT})`);
    // hosts
    cy.getIframeBody().contains('example.com');
    cy.getIframeBody().contains('*.example.com');
  });

  it('Edit Gateway', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Servers')
      .click();

    // name should be disabled for edit
    cy.getIframeBody()
      .find('[ariaLabel="Gateway name"]:visible', { log: false })
      .should('have.attr', 'readonly');

    cy.getIframeBody()
      .contains('HTTPS Redirect')
      .scrollIntoView();

    // change server to HTTPS
    cy.getIframeBody()
      .filter(':visible', { log: false })
      .contains('HTTP')
      .click();

    cy.getIframeBody()
      .contains(/^HTTPS$/)
      .click();

    // secret
    cy.getIframeBody()
      .find('[placeholder^="Start typing to select Secret"]:visible', {
        log: false,
      })
      .type(KYMA_GATEWAY_CERTS);

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();

    // changed details
    cy.getIframeBody().contains(`${SERVER_NAME} (443:${TARGET_PORT})`);
    cy.getIframeBody().contains(/simple/i);
    cy.getIframeBody().contains(KYMA_GATEWAY_CERTS);
  });

  it('Inspect list', () => {
    cy.inspectList('Gateways', GATEWAY_NAME);
  });
});
