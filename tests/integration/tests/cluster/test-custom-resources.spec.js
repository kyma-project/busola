/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions-cluster.yaml';

function openSearchWithSlashShortcut() {
  cy.get('body').type('/', { force: true });
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();

    cy.navigateTo('Configuration', 'Custom Resource Definitions');

    cy.contains('ui5-button', 'Create Custom Resource Definition').click();

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
      .type('cypress', { force: true });

    cy.get('table').should('have.length', 1);

    cy.get('[role=row]')
      .contains('Tclusters')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('Tclusters')
      .click();

    cy.contains('ui5-title', 'Tclusters').should('be.visible');

    cy.contains('ui5-button', /Create Tcluster/i).should('be.visible');

    cy.url().should('match', /customresources/);
    cy.contains('tcluster.cypress.example.com').click();
    cy.url().should('match', /customresourcedefinitions/);
    cy.deleteInDetails('tcluster.cypress.example.com');
  });
});
