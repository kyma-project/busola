/// <reference types="cypress" />
import 'cypress-file-upload';
import { loadFile } from '../../support/loadFile';

const PV_NAME = `test-pv-${Math.random()
  .toString()
  .substr(2, 8)}`;

async function loadPV(pvName) {
  const PV = await loadFile('test-persistent-volumes.yaml');

  const newPV = { ...PV };
  newPV.metadata.name = pvName;
  return newPV;
}

context('Test Persistent Volumes', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Create PV', () => {
    cy.navigateTo('Storage', 'Persistent Volumes');

    cy.getIframeBody()
      .contains('Create Persistent Volume')
      .click();

    cy.wrap(loadPV(PV_NAME)).then(PV_CONFIG => {
      const PV = JSON.stringify(PV_CONFIG);
      cy.pasteToMonaco(PV);
    });

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains('h3', PV_NAME)
      .should('be.visible');
  });

  it('Check PV details', () => {
    cy.getIframeBody()
      .find('[data-testid=persistent-volumes-ref]')
      .contains('ReadWriteOnce')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Events')
      .should('be.visible');
  });

  it('Check PV list and delete', () => {
    cy.getIframeBody()
      .contains('a', 'Persistent Volumes')
      .click();

    cy.deleteFromGenericList(PV_NAME);
  });
});
