/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const PV_NFS_NAME = `test-pv-${Math.random()
  .toString()
  .substr(2, 8)}`;

const PV_CSI_NAME = `test-pv-${Math.random()
  .toString()
  .substr(2, 8)}`;

async function loadPV(pvName, fileName) {
  const PV = await loadFile(fileName);

  const newPV = { ...PV };
  newPV.metadata.name = pvName;
  return newPV;
}

context('Test Persistent Volumes', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create PV with NFS', () => {
    cy.navigateTo('Storage', 'Persistent Volumes');

    cy.openCreate().click();

    cy.wrap(loadPV(PV_NFS_NAME, 'test-persistent-volume-NFS.yaml')).then(
      PV_CONFIG => {
        const PV = JSON.stringify(PV_CONFIG);
        cy.pasteToMonaco(PV);
      },
    );

    cy.saveChanges('Create');

    cy.contains('ui5-title', PV_NFS_NAME).should('be.visible');
  });

  it('Check PV with NFS details', () => {
    cy.getMidColumn()
      .contains('ReadWriteOnce')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Events')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Filesystem')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Recycle')
      .should('be.visible');

    cy.getMidColumn()
      .contains('slow')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Network File System')
      .should('be.visible');

    cy.getMidColumn()
      .contains('172.17.0.2')
      .should('be.visible');

    cy.getMidColumn()
      .contains('/tmp')
      .should('be.visible');
  });

  it('Check PV with NFS on the list and delete', () => {
    cy.closeMidColumn();

    cy.deleteFromGenericList('Persistent Volume', PV_NFS_NAME);
  });

  it('Create PV with CSI', () => {
    cy.openCreate().click();

    cy.wrap(loadPV(PV_CSI_NAME, 'test-persistent-volume-CSI.yaml')).then(
      PV_CONFIG => {
        const PV = JSON.stringify(PV_CONFIG);
        cy.pasteToMonaco(PV);
      },
    );

    cy.saveChanges('Create');

    cy.contains('ui5-title', PV_CSI_NAME).should('be.visible');
  });

  it('Check PV with NFS details', () => {
    cy.getMidColumn()
      .contains('ReadWriteOnce')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Events')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Filesystem')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Retain')
      .should('be.visible');

    cy.getMidColumn()
      .contains('ext4')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Container Storage Interface')
      .should('be.visible');

    cy.getMidColumn()
      .contains('csi-driver.example.com')
      .should('be.visible');

    cy.getMidColumn()
      .contains('existingVolumeName')
      .should('be.visible');
  });

  it('Check PV with NFS on the list and delete', () => {
    cy.closeMidColumn();

    cy.deleteFromGenericList('Persistent Volume', PV_CSI_NAME);
  });
});
