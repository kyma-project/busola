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

    cy.getIframeBody()
      .contains('Create Storage Class')
      .click();

    cy.wrap(loadSC(Cypress.env('STORAGE_CLASS_NAME'))).then(SC_CONFIG => {
      const SC = JSON.stringify(SC_CONFIG);

      cy.pasteToMonaco(SC);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Checking details', () => {
    cy.getIframeBody()
      .contains(Cypress.env('STORAGE_CLASS_NAME'))
      .should('be.visible');

    cy.getIframeBody()
      .contains('pd.csi.storage.gke.io')
      .should('be.visible');

    cy.getIframeBody()
      .contains('pd-ssd')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Retain')
      .should('be.visible');
  });

  it('Checking list and delete', () => {
    cy.getIframeBody()
      .contains('Storage Classes')
      .click();

    cy.deleteFromGenericList(Cypress.env('STORAGE_CLASS_NAME'));
  });
});
