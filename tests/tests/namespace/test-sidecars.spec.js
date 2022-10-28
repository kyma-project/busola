/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

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
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  beforeEach(async () => {
    cy.setBusolaFeature('EXTENSIBILITY', true);

    await cy.mockExtension(
      'SIDECARS',
      'examples/resources/istio/sidecars.yaml',
    );
  });

  it('Create a Sidecar', () => {
    cy.navigateTo('Istio', 'Sidecars');

    cy.getIframeBody()
      .contains('Create Sidecar')
      .click();

    // Name
    cy.getIframeBody()
      .find('[arialabel="Sidecar name"]:visible', { log: false })
      .type(SIDECAR_NAME);

    // Egress
    cy.getIframeBody()
      .find('[aria-label="expand Egress"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Egress"]:visible', { log: false })
      .eq(1)
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Port"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter the port number"]:visible', { log: false })
      .type(PORT_NUMBER);

    cy.getIframeBody()
      .find('[arialabel="Sidecar name"]:visible', { log: false })
      .filterWithNoValue()
      .type(EGRESS_NAME);

    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(PORT_PROTOCOL);

    cy.getIframeBody()
      .find('[aria-label="expand Hosts"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="For example, *.api.mydomain.com"]:visible', {
        log: false,
      })
      .type(EGRESS_HOST);

    cy.getIframeBody()
      .find('[aria-label="expand Egress"]:visible', { log: false })
      .first()
      .click();

    // Ingress
    cy.getIframeBody()
      .find('[aria-label="expand Ingress"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Ingress"]:visible', { log: false })
      .eq(1)
      .click();

    cy.getIframeBody()
      .find('[aria-label="expand Port"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter the port number"]:visible', { log: false })
      .type(PORT_NUMBER);

    cy.getIframeBody()
      .find('[aria-label="Combobox input"]:visible', { log: false })
      .first()
      .type(PORT_PROTOCOL);

    cy.getIframeBody()
      .find('[ariaLabel="Sidecar name"]:visible', { log: false })
      .filterWithNoValue()
      .type(IGRES_NAME);

    cy.getIframeBody()
      .find('[placeholder="For example, 127.0.0.1:PORT"]:visible', {
        log: false,
      })
      .type(DEFAULT_ENDPOINT);

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', SIDECAR_NAME)
      .should('be.visible');
  });

  it('Check the Sidecar details', () => {
    cy.getIframeBody().contains(PORT_NUMBER);
    cy.getIframeBody().contains(EGRESS_NAME);
    cy.getIframeBody().contains(IGRES_NAME);
    cy.getIframeBody().contains(PORT_PROTOCOL);
    cy.getIframeBody().contains(EGRESS_HOST);
    cy.getIframeBody().contains(DEFAULT_ENDPOINT);
  });

  it('Check the Sidecars list', () => {
    cy.inspectList('Sidecars', SIDECAR_NAME);
  });
});
