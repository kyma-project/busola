/// <reference types="cypress" />

// Also column layout test

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions-cluster.yaml';
const TCLUSTER_FILE_NAME = 'test-Tcluster.yaml';

function openSearchWithSlashShortcut() {
  cy.get('body').type('/', { force: true });
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Custom Resource Definitions');

    cy.openCreate();

    cy.wrap(loadFile(FILE_NAME)).then((CRD_CONFIG) => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.checkUnsavedDialog();

    cy.saveChanges('Create');
  });

  it('Check CR groups list with slash shortcut', () => {
    cy.getLeftNav().contains('Custom Resources').click();

    cy.contains('ui5-title', 'Custom Resources').should('be.visible');

    openSearchWithSlashShortcut();

    cy.typeInSearch('cypress', true);

    cy.get('ui5-table').should('have.length', 1);

    cy.get('ui5-table-row').contains('Tclusters').should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('ui5-table-row').contains('Tclusters').click();

    cy.contains('ui5-title', 'Tclusters').should('be.visible');

    cy.contains('ui5-button', /Create/i).should('be.visible');

    cy.url().should('match', /customresources/);
    cy.contains('tcluster.cypress.example.com').click();
    cy.url().should('match', /customresourcedefinitions/);
  });

  it('Create Tcluster', () => {
    cy.getLeftNav().contains('Custom Resources').click();

    cy.wait(500).typeInSearch('cypress');

    cy.wait(500).clickGenericListLink('Tclusters');

    cy.openCreate();

    cy.wrap(loadFile(TCLUSTER_FILE_NAME)).then((TC_CONFIG) => {
      const TC = JSON.stringify(TC_CONFIG);
      cy.pasteToMonaco(TC);
    });

    cy.checkUnsavedDialog();

    cy.saveChanges('Create');
  });

  it('Test column layout and remove CRD', () => {
    cy.reload();
    cy.wait(2000);

    cy.getLeftNav().contains('Custom Resources').click();

    cy.getStartColumn()
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .wait(500)
      .clear();

    cy.typeInSearch('cypress');

    cy.clickGenericListLink('Tclusters');

    cy.testMidColumnLayout('Tclusters', false);

    cy.getStartColumn()
      .find('ui5-input[id^=search-]:visible')
      .find('input')
      .wait(500)
      .clear();

    cy.typeInSearch('cypress');

    cy.clickGenericListLink('Tclusters');

    cy.getMidColumn()
      .get('ui5-table-row')
      .find('ui5-table-cell')
      .contains('ui5-text', 'tcluster-test')
      .click()
      .wait(500);

    cy.testEndColumnLayout('tcluster-test', false);

    cy.getMidColumn()
      .get('ui5-table-row')
      .find('ui5-table-cell')
      .contains('ui5-text', 'tcluster-test')
      .click()
      .wait(500);

    cy.getMidColumn()
      .find('ui5-button[accessible-name="enter-full-screen"]')
      .should('not.exist');

    cy.wait(1000); //wait for button

    cy.getEndColumn()
      .contains('ui5-button', 'Delete')
      .should('be.visible')
      .click();

    cy.contains(`delete Tcluster tcluster-test`);

    cy.get(`[header-text="Delete Tcluster"]:visible`)
      .find('[data-testid="delete-confirmation"]')
      .click();

    cy.contains(/deleted/).should('be.visible');

    cy.getEndColumn().should('not.be.visible');

    cy.getMidColumn().contains('tcluster.cypress.example.com').click();

    cy.url().should('match', /customresourcedefinitions/);

    cy.deleteInDetails(
      'Custom Resource Definition',
      'tcluster.cypress.example.com',
    );
  });
});
