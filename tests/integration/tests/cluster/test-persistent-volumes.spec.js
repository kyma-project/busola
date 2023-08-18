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

    cy.contains('Create Persistent Volume').click();

    cy.wrap(loadPV(PV_NAME)).then(PV_CONFIG => {
      const PV = JSON.stringify(PV_CONFIG);
      cy.pasteToMonaco(PV);
    });

    cy.contains('[role="dialog"] button', 'Create').click();

    cy.contains('h3', PV_NAME).should('be.visible');
  });

  it('Check PV details', () => {
    cy.contains('ReadWriteOnce').should('be.visible');

    cy.contains('Events').should('be.visible');
  });

  it('Check PV list and delete', () => {
    cy.get('ui5-breadcrumbs')
      .find('ui5-link[href*="persistentvolumes"]', {
        includeShadowDom: true,
      })
      .should('contain.text', 'Persistent Volumes')
      .find('a[href*="persistentvolumes"]', {
        includeShadowDom: true,
      })
      .should('be.visible')
      .click({ force: true });

    cy.deleteFromGenericList(PV_NAME);
  });
});
