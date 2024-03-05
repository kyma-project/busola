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

    cy.contains('ui5-button', 'Create').click();

    cy.wrap(loadFile(FILE_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Check CR groups list with slash shortcut', () => {
    cy.getLeftNav()
      .contains('Custom Resources')
      .click();

    cy.contains('ui5-title', 'Custom Resources').should('be.visible');

    openSearchWithSlashShortcut();

    cy.get('ui5-input[placeholder="Search"]')
      .find('input')
      .click()
      .type('cypress', {
        force: true,
      });

    cy.get('table').should('have.length', 1);

    cy.get('ui5-table-row')
      .contains('Tclusters')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('ui5-table-row')
      .contains('Tclusters')
      .click();

    cy.contains('ui5-title', 'Tclusters').should('be.visible');

    cy.contains('ui5-button', /Create/i).should('be.visible');

    cy.url().should('match', /customresources/);
    cy.contains('tcluster.cypress.example.com').click();
    cy.url().should('match', /customresourcedefinitions/);
  });

  it('Create Tcluster', () => {
    cy.getLeftNav()
      .contains('Custom Resources')
      .click();

    cy.clickGenericListLink('Tclusters');

    cy.contains('ui5-button', 'Create').click();

    cy.wrap(loadFile(TCLUSTER_FILE_NAME)).then(TC_CONFIG => {
      const TC = JSON.stringify(TC_CONFIG);
      cy.pasteToMonaco(TC);
    });

    cy.get('ui5-dialog:visible')
      .contains('ui5-button', 'Create')
      .should('be.visible')
      .click();
  });

  it('Test column layout and remove CRD', () => {
    cy.getLeftNav()
      .contains('Custom Resources')
      .click();

    cy.clickGenericListLink('Tclusters');

    cy.testMidColumnLayout('Tclusters');

    cy.clickGenericListLink('Tclusters');

    cy.getMidColumn()
      .get('ui5-table-row')
      .find('ui5-table-cell')
      .contains('span', 'tcluster-test')
      .click();

    cy.testEndColumnLayout('tcluster-test');

    cy.getMidColumn()
      .get('ui5-table-row')
      .find('ui5-table-cell')
      .contains('span', 'tcluster-test')
      .click();

    cy.getMidColumn()
      .find('ui5-button[aria-label="full-screen"]')
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

    cy.getEndColumn().should('not.exist');

    cy.getMidColumn()
      .contains('tcluster.cypress.example.com')
      .click();

    cy.url().should('match', /customresourcedefinitions/);

    cy.deleteInDetails(
      'Custom Resource Definition',
      'tcluster.cypress.example.com',
    );
  });
});
