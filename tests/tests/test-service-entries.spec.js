/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

const FILE_NAME = 'test-service-entry.yaml';

const SE_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const RESOLUTION = 'STATIC';
const LOCATION = 'MESH_EXTERNAL';
const HOST = 'test.com';
const ADDRESS = '192.192.192.192/24';
const WORKLOAD_SELECTOR_LABEL = 'test=test';

async function loadSE(name, namespace, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;

  return newResource;
}

context('Test Service Entries', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Service Entry', () => {
    cy.navigateTo('Istio', 'Service Entries');

    cy.getIframeBody()
      .contains('Create Service Entry')
      .click();

    cy.wrap(loadSE(SE_NAME, Cypress.env('NAMESPACE_NAME'), FILE_NAME)).then(
      SE_CONFIG => {
        const SE = JSON.stringify(SE_CONFIG);
        cy.pasteToMonaco(SE);
      },
    );

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', SE_NAME)
      .should('be.visible');
  });

  it('Check the Service Entry details', () => {
    cy.getIframeBody().contains(RESOLUTION);
    cy.getIframeBody().contains(LOCATION);
    cy.getIframeBody().contains(HOST);
    cy.getIframeBody().contains(ADDRESS);
    cy.getIframeBody().contains(WORKLOAD_SELECTOR_LABEL);
  });

  it('Check the Service Entries list', () => {
    cy.getLeftNav()
      .contains('Service Entries')
      .click();

    cy.getIframeBody()
      .contains(SE_NAME)
      .parent()
      .getIframeBody()
      .contains(RESOLUTION);
  });

  it('Delete a Service Entry', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', SE_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', SE_NAME)
      .should('not.exist');
  });
});
