/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

async function loadSC(scName) {
  const SC = await loadFile('test-storage-classes.yaml');

  const newSC = { ...SC };
  newSC.metadata.name = scName;
  return newSC;
}

context('Test Storage Classes', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create Storage Class', () => {
    cy.navigateTo('Storage', 'Storage Classes');

    cy.contains('ui5-button', 'Create Storage Class').click();

    cy.wrap(loadSC(Cypress.env('STORAGE_CLASS_NAME'))).then(SC_CONFIG => {
      const SC = JSON.stringify(SC_CONFIG);

      cy.pasteToMonaco(SC);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Checking details', () => {
    cy.getMidColumn()
      .contains('ui5-title', Cypress.env('STORAGE_CLASS_NAME'))
      .should('be.visible');

    cy.getMidColumn()
      .contains('pd.csi.storage.gke.io')
      .should('be.visible');

    cy.getMidColumn()
      .contains('pd-ssd')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Retain')
      .should('be.visible');
  });

  it('Checking list and delete', () => {
    cy.closeMidColumn();

    cy.deleteFromGenericList(
      'Storage Class',
      Cypress.env('STORAGE_CLASS_NAME'),
    );
  });
});
