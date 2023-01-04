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

    cy.contains('Create Gateway').click();

    // name
    cy.get('[ariaLabel="Gateway name"]:visible', { log: false }).type(
      GATEWAY_NAME,
    );

    // selector
    cy.get('[placeholder="Enter key"]:visible', { log: false })
      .filterWithNoValue()
      .type('selector');

    cy.get('[placeholder="Enter value"]:visible', { log: false })
      .filterWithNoValue()
      .first()
      .type('selector-value');

    // server
    cy.get('[aria-label="expand Servers"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[data-testid="spec.servers.0.port.number"]:visible').type(
      PORT_NUMBER,
    );

    cy.get('[aria-label="Combobox input"]:visible', { log: false }).type(
      PORT_PROTOCOL,
    );

    cy.get('[ariaLabel^="Gateway name"]:visible', { log: false })
      .eq(1)
      .type(SERVER_NAME);

    cy.get('[data-testid="spec.servers.0.port.targetPort"]:visible').type(
      TARGET_PORT,
    );

    // hosts
    cy.get('[aria-label="expand Hosts"]:visible', { log: false }).click();

    cy.get('[placeholder="For example, *.api.mydomain.com"]:visible', {
      log: false,
    }).type('example.com');

    cy.get('[placeholder="For example, *.api.mydomain.com"]:visible', {
      log: false,
    })
      .filterWithNoValue()
      .type('*.example.com');

    // create
    cy.get('[role=dialog]')
      .contains('button', 'Create')
      .click();
  });

  it('Inspect details', () => {
    cy.contains(GATEWAY_NAME);
    cy.contains(SELECTOR);
    // default selector
    cy.contains('istio=ingressgateway');
    cy.contains(SERVER_NAME);
    cy.contains(PORT_NUMBER);
    cy.contains(TARGET_PORT);
    // hosts
    cy.contains('example.com');
    cy.contains('*.example.com');
  });

  it('Edit Gateway', () => {
    cy.contains('Edit').click();

    cy.get('[ariaLabel="Gateway name"]:visible', { log: false }).should(
      'have.attr',
      'readonly',
    );

    cy.get('[aria-label="expand Servers"]:visible', {
      log: false,
    }).click();

    // change server to HTTPS
    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .clear()
      .type('HTTPS');

    cy.get('[data-testid="spec.servers.0.port.number"]:visible')
      .clear()
      .type('443');

    cy.get('[aria-label="expand Port"]:visible', {
      log: false,
    }).click();

    cy.get('[aria-label="expand TLS"]:visible', {
      log: false,
    }).click();

    // secret
    cy.get('[aria-label="Choose Secret"]:visible', {
      log: false,
    }).type(KYMA_GATEWAY_CERTS);

    cy.get('[aria-label="Combobox input"]:visible', { log: false }).type(
      'SIMPLE',
    );

    cy.get('[role=dialog]')
      .contains('button', 'Update')
      .click();

    // changed details
    cy.contains('443');
    cy.contains('HTTPS');
    cy.contains(/simple/i);
    cy.contains(KYMA_GATEWAY_CERTS);
  });

  it('Inspect list', () => {
    cy.inspectList('Gateways', GATEWAY_NAME);
  });
});
