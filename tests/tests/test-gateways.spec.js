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
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Gateways node should be present', () => {
    cy.getLeftNav()
      .contains('Istio')
      .click();

    cy.getLeftNav()
      .contains('Gateways')
      .click();
  });

  it('Create Gateway', () => {
    cy.getIframeBody()
      .contains('Create Gateway')
      .click();

    // name
    cy.getIframeBody()
      .find('[placeholder="Gateway Name"]')
      .filter(':visible', { log: false })
      .type(GATEWAY_NAME);

    // selector
    cy.getIframeBody()
      .find('[placeholder="Enter Key"]')
      .filter(':visible', { log: false })
      .type('selector-key');

    cy.getIframeBody()
      .find('[placeholder="Enter Value"]')
      .filter(':visible', { log: false })
      .first()
      .type('selector-value');

    // server name
    cy.getIframeBody()
      .find('[placeholder^="Enter the name"]')
      .filter(':visible', { log: false })
      .type(SERVER_NAME);

    // hosts
    cy.getIframeBody()
      .find('[placeholder^="Enter the hosts"]')
      .filter(':visible', { log: false })
      .type('example.com{downarrow}*.example.com');

    // server target port
    cy.getIframeBody()
      .find('[placeholder^="Enter the target port"]')
      .filter(':visible', { log: false })
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
      .contains('Advanced')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .contains('Servers')
      .click();

    // name should be disabled for edit
    cy.getIframeBody()
      .find('[placeholder="Gateway Name"]')
      .filter(':visible', { log: false })
      .should('have.attr', 'readonly');

    cy.getIframeBody()
      .contains('TLS settings are not available for a non-HTTPS protocol.')
      .should('be.visible');

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
      .find('[placeholder^="Start typing to select Secret"]')
      .filter(':visible', { log: false })
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
    cy.getIframeBody()
      .contains('Gateways')
      .click();

    // name
    cy.getIframeBody().contains(GATEWAY_NAME);
  });
});
