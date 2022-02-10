/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../support/loadFile';

const FILE_NAME = 'test-persistent-volume-claim.yaml';

const PVC_NAME =
  'test-' +
  Math.random()
    .toString()
    .substr(2, 8);

const CAPACITY_VALUE = '1Gi';
const ACCESS_MODES_VALUE = 'ReadWriteOnce';
const VOLUME_MODE_VALUE = 'Filesystem';

async function loadPVC(name, namespace, storage, fileName) {
  const resource = await loadFile(fileName);
  const newResource = { ...resource };

  newResource.metadata.name = name;
  newResource.metadata.namespace = namespace;
  newResource.spec.storageClassName = storage;

  return newResource;
}

context('Test Persistent Volume Claims', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Create a Persistent Volume Claim', () => {
    cy.navigateTo('Storage', 'Persistent Volume Claims');

    cy.getIframeBody()
      .contains('Create Persistent Volume Claim')
      .click();

    cy.wrap(
      loadPVC(
        PVC_NAME,
        Cypress.env('NAMESPACE_NAME'),
        Cypress.env('STORAGE_CLASS_NAME'),
        FILE_NAME,
      ),
    ).then(PVC_CONFIG => {
      const PVC = JSON.stringify(PVC_CONFIG);
      cy.pasteToMonaco(PVC);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', PVC_NAME)
      .should('be.visible');
  });

  it('Check the Persistent Volume Claims details', () => {
    cy.getIframeBody()
      .contains(CAPACITY_VALUE)
      .should('be.visible');

    cy.getIframeBody()
      .contains(ACCESS_MODES_VALUE)
      .should('be.visible');

    cy.getIframeBody()
      .contains(VOLUME_MODE_VALUE)
      .should('be.visible');

    cy.getIframeBody()
      .contains('a', Cypress.env('STORAGE_CLASS_NAME'))
      .should('be.visible');

    cy.getIframeBody()
      .contains('Events')
      .should('be.visible');
  });

  it('Check the Persistent Volume Claims list', () => {
    cy.getLeftNav()
      .contains('Persistent Volume Claims')
      .click();

    cy.getIframeBody()
      .contains(PVC_NAME)
      .parent()
      .getIframeBody()
      .contains(CAPACITY_VALUE);
  });

  it('Delete a Persistent Volume Claim', () => {
    cy.getIframeBody()
      .contains('.fd-table__row', PVC_NAME)
      .find('button[data-testid="delete"]')
      .click();

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains('.fd-table__row', PVC_NAME)
      .should('not.exist');
  });

  it('Delete the connected Storage Class', () => {
    cy.get('[data-testid=luigi-topnav-logo]').click();

    cy.navigateTo('Storage', 'Storage Classes');

    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type(Cypress.env('STORAGE_CLASS_NAME'));

    cy.getIframeBody()
      .find('tbody tr [aria-label="Delete"]')
      .click({ force: true });

    cy.getIframeBody()
      .contains('button', 'Delete')
      .click();

    cy.getIframeBody()
      .contains(Cypress.env('STORAGE_CLASS_NAME'), {
        timeout: 10000,
      })
      .should('not.exist');
  });
});
