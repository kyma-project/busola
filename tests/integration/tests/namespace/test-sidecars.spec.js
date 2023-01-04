/// <reference types="cypress" />
import 'cypress-file-upload';

const SIDECAR_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const PORT_NUMBER = '81';
const EGRESS_NAME = 'egresshttp';
const IGRES_NAME = 'somename';
const PORT_PROTOCOL = 'HTTP';
const EGRESS_HOST = 'testhost/*';
const DEFAULT_ENDPOINT = '127.0.0.1:8080';

context('Test Sidecars', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
    cy.mockExtensions(['examples/resources/istio/sidecars.yaml']);

    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Sidecar', () => {
    cy.navigateTo('Istio', 'Sidecars');

    cy.contains('Create Sidecar').click();

    // Name
    cy.get('[arialabel="Sidecar name"]:visible', { log: false }).type(
      SIDECAR_NAME,
    );

    // Egress
    cy.get('[aria-label="expand Egress"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[aria-label="expand Port"]:visible', { log: false }).click();

    cy.get('[placeholder="Enter the port number"]:visible', {
      log: false,
    }).type(PORT_NUMBER);

    cy.get('[arialabel="Sidecar name"]:visible', { log: false })
      .filterWithNoValue()
      .type(EGRESS_NAME);

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(PORT_PROTOCOL);

    cy.get('[aria-label="expand Hosts"]:visible', { log: false }).click();

    cy.get('[placeholder="For example, *.api.mydomain.com"]:visible', {
      log: false,
    }).type(EGRESS_HOST);

    cy.get('[aria-label="expand Egress"]:visible', { log: false })
      .first()
      .click();

    // Ingress
    cy.get('[aria-label="expand Ingress"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.get('[aria-label="expand Port"]:visible', { log: false }).click();

    cy.get('[placeholder="Enter the port number"]:visible', {
      log: false,
    }).type(PORT_NUMBER);

    cy.get('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(PORT_PROTOCOL);

    cy.get('[ariaLabel="Sidecar name"]:visible', { log: false })
      .filterWithNoValue()
      .type(IGRES_NAME);

    cy.get('[placeholder="For example, 127.0.0.1:PORT"]:visible', {
      log: false,
    }).type(DEFAULT_ENDPOINT);

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', SIDECAR_NAME).should('be.visible');
  });

  it('Check the Sidecar details', () => {
    cy.contains(PORT_NUMBER);
    cy.contains(EGRESS_NAME);
    cy.contains(IGRES_NAME);
    cy.contains(PORT_PROTOCOL);
    cy.contains(EGRESS_HOST);
    cy.contains(DEFAULT_ENDPOINT);
  });

  it('Check the Sidecars list', () => {
    cy.inspectList('Sidecars', SIDECAR_NAME);
  });
});
