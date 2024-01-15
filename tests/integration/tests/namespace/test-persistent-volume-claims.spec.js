/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

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

    cy.contains('ui5-button', 'Create Persistent Volume Claim').click();

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

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();

    cy.contains('ui5-title', PVC_NAME).should('be.visible');
  });

  it('Check the Persistent Volume Claims details', () => {
    cy.getMidColumn()
      .contains(CAPACITY_VALUE)
      .should('be.visible');

    cy.getMidColumn()
      .contains(ACCESS_MODES_VALUE)
      .should('be.visible');

    cy.getMidColumn()
      .contains(VOLUME_MODE_VALUE)
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-panel', Cypress.env('STORAGE_CLASS_NAME'))
      .should('be.visible');

    cy.getMidColumn()
      .contains('Events')
      .should('be.visible');
  });

  it('Check the Persistent Volume Claims list and delete', () => {
    cy.getLeftNav()
      .contains('Persistent Volume Claims')
      .click();

    cy.contains(CAPACITY_VALUE);

    cy.deleteFromGenericList('Persistent Volume Claim', PVC_NAME);
  });
});
