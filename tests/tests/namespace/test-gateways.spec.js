/// <reference types="cypress" />
import 'cypress-file-upload';

const GATEWAY_NAME =
  'test-gateway-' +
  Math.random()
    .toString()
    .substr(2, 8);

const SERVER_NAME = GATEWAY_NAME + '-server';
const PORT_NUMBER = 80;
const TARGET_PORT = 8080;
const PORT_PROTOCOL = 'HTTP';
const SELECTOR = 'selector=selector-value';

const KYMA_GATEWAY_CERTS = 'kyma-gateway-certs';

context('Test Gateways', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions(['examples/resources/istio/gateways.yaml']);

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
      .type('selector');

    cy.getIframeBody()
      .find('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    // server
    cy.getIframeBody()
      .find('[aria-label="expand Servers"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[data-testid="spec.servers.0.port.number"]:visible')
      .type(PORT_NUMBER);

    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .type(PORT_PROTOCOL);

    cy.getIframeBody()
      .find('[ariaLabel^="Gateway name"]:visible', { log: false })
      .eq(1)
      .type(SERVER_NAME);

    cy.getIframeBody()
      .find('[data-testid="spec.servers.0.port.targetPort"]:visible')
      .type(TARGET_PORT);

    // hosts
    cy.getIframeBody()
      .find('[aria-label="expand Hosts"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="For example, *.api.mydomain.com"]:visible', {
        log: false,
      })
      .type('example.com');

    cy.getIframeBody()
      .find('[placeholder="For example, *.api.mydomain.com"]:visible', {
        log: false,
      })
      .filterWithNoValue()
      .type('*.example.com');

    // create
    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    cy.getIframeBody().contains(GATEWAY_NAME);
    cy.getIframeBody().contains(SELECTOR);
    // default selector
    cy.getIframeBody().contains('istio=ingressgateway');
    cy.getIframeBody().contains(SERVER_NAME);
    cy.getIframeBody().contains(PORT_NUMBER);
    cy.getIframeBody().contains(TARGET_PORT);
    // hosts
    cy.getIframeBody().contains('example.com');
    cy.getIframeBody().contains('*.example.com');
  });

  it('Edit Gateway', () => {
    cy.getIframeBody()
      .contains('Edit')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="Gateway name"]:visible', { log: false })
      .should('have.attr', 'readonly');

    cy.getIframeBody()
      .find('[aria-label="expand Servers"]:visible', {
        log: false,
      })
      .click();

    // change server to HTTPS
    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .clear()
      .type('HTTPS');

    cy.getIframeBody()
      .find('[data-testid="spec.servers.0.port.number"]:visible')
      .clear()
      .type('443');

    cy.getIframeBody()
      .find('[aria-label="expand Port"]:visible', {
        log: false,
      })
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand TLS"]:visible', {
        log: false,
      })
      .click();

    // secret
    cy.getIframeBody()
      .find('[aria-label="Choose Secret"]:visible', {
        log: false,
      })
      .type(KYMA_GATEWAY_CERTS);

    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .type('SIMPLE');

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('button', 'Update')
      .click();

    // changed details
    cy.getIframeBody().contains('443');
    cy.getIframeBody().contains('HTTPS');
    cy.getIframeBody().contains(/simple/i);
    cy.getIframeBody().contains(KYMA_GATEWAY_CERTS);
  });

  it('Inspect list', () => {
    cy.inspectList('Gateways', GATEWAY_NAME);
  });
});
