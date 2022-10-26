/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-sidecar.yaml';

const SIDECAR_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const OUTBOUND_TRAFFIC_POLICY = 'ALLOW_ANY';
const WORKLOAD_SELECTOR_LABEL = 'app=ratings';
const EGRESS_HOST = 'testhost/*';
const DEFAULT_ENDPOINT = '127.0.0.1:8080';
const PORT_NUMBER = '81';
const PORT_PROTOCOL = 'HTTP';
const PORT_NAME = 'portname';

async function loadSidecar(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Sidecars', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  beforeEach(() => {
    cy.setBusolaFeature('EXTENSIBILITY', true);
  });

  it('Create a Sidecar', () => {
    cy.navigateTo('Istio', 'Sidecars');

    cy.getIframeBody()
      .contains('Create Sidecar')
      .click();

    // Name
    cy.getIframeBody()
      .find('[ariaLabel="Sidecar name"]:visible', { log: false })
      .type(SIDECAR_NAME);

    // Egress
    cy.getIframeBody()
      .find('[ariaLabel="expand Egress"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="expand Egress"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="expand Port"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter the port number"]:visible', { log: false })
      .type('9080');

    cy.getIframeBody()
      .find('[ariaLabel="Sidecar name"]:visible', { log: false })
      .filterWithNoValue()
      .type('egresshttp');

    cy.getIframeBody()
      .find('[ariaLabel="Combobox input"]:visible', { log: false })
      .first()
      .type('HTTP');

    cy.getIframeBody()
      .find('[ariaLabel="expand Hosts"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="For example, *.api.mydomain.com"]:visible', {
        log: false,
      })
      .type('prod-us1/*');

    cy.getIframeBody()
      .find('[ariaLabel="expand Egress"]:visible', { log: false })
      .first()
      .click();

    // Ingress
    cy.getIframeBody()
      .find('[ariaLabel="expand Ingress"]:visible', { log: false })
      .contains('Add')
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="expand Ingress"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[ariaLabel="expand Port"]:visible', { log: false })
      .click();

    cy.getIframeBody()
      .find('[placeholder="Enter the port number"]:visible', { log: false })
      .type('9080');

    cy.getIframeBody()
      .find('[ariaLabel="Sidecar name"]:visible', { log: false })
      .filterWithNoValue()
      .type('somename');

    cy.getIframeBody()
      .find('[ariaLabel="Combobox input"]:visible', { log: false })
      .first()
      .type('HTTP');

    cy.getIframeBody()
      .find('[placeholder="For example, 127.0.0.1:PORT"]:visible', {
        log: false,
      })
      .type('unix:///var/run/someuds.sock');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', SIDECAR_NAME)
      .should('be.visible');
  });

  it('Check the Sidecar details', () => {
    cy.getIframeBody().contains(OUTBOUND_TRAFFIC_POLICY);
    cy.getIframeBody().contains(WORKLOAD_SELECTOR_LABEL);
    cy.getIframeBody().contains(EGRESS_HOST);
    cy.getIframeBody().contains(DEFAULT_ENDPOINT);
    cy.getIframeBody().contains(PORT_NUMBER);
    cy.getIframeBody().contains(PORT_PROTOCOL);
    cy.getIframeBody().contains(PORT_NAME);
  });

  it('Check the Sidecars list', () => {
    cy.inspectList('Sidecars', SIDECAR_NAME);
  });
});
