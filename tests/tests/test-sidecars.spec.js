/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

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

  it('Create a Sidecar', () => {
    cy.navigateTo('Istio', 'Sidecars');

    cy.getIframeBody()
      .contains('Create Sidecar')
      .click();

    cy.wrap(
      loadSidecar(SIDECAR_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME),
    ).then(SIDECAR_CONFIG => {
      const sidecar = JSON.stringify(SIDECAR_CONFIG);
      cy.pasteToMonaco(sidecar);
    });

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
    cy.getLeftNav()
      .contains('Sidecars')
      .click();

    cy.getIframeBody()
      .contains(SIDECAR_NAME)
      .parent()
      .getIframeBody()
      .contains(OUTBOUND_TRAFFIC_POLICY);
  });

  it('Delete a Sidecar', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', SIDECAR_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', SIDECAR_NAME)
      .should('not.exist');
  });
});
