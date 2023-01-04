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
    cy.wait(500); // TODO
    cy.navigateTo('Storage', 'Persistent Volume Claims');

    cy.contains('Create Persistent Volume Claim').click();

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

    cy.get('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.contains('h3', PVC_NAME).should('be.visible');
  });

  it('Check the Persistent Volume Claims details', () => {
    cy.contains(CAPACITY_VALUE).should('be.visible');

    cy.contains(ACCESS_MODES_VALUE).should('be.visible');

    cy.contains(VOLUME_MODE_VALUE).should('be.visible');

    cy.contains(Cypress.env('STORAGE_CLASS_NAME')).should('be.visible');

    cy.contains('Events').should('be.visible');
  });

  it('Check the Persistent Volume Claims list and delete', () => {
    cy.contains('a', 'Persistent Volume Claims').click();

    cy.contains(CAPACITY_VALUE);

    cy.deleteFromGenericList(PVC_NAME);
  });
});
