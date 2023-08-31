/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions-namespaced.yaml';

function getQueryInput() {
  return cy.get('[aria-label=command-palette-search]');
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    cy.get('body').type(
      `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
    );

    getQueryInput().type('up');

    cy.contains('Upload YAML').click();

    cy.wrap(loadFile(FILE_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.get('[role="dialog"]')
      .get('ui5-button')
      .contains('Submit')
      .should('be.visible')
      .click();

    cy.get('.fd-dialog__body')
      .find('.sap-icon--message-success')
      .should('have.length', 1);

    cy.get('[role="dialog"]')
      .get('ui5-button')
      .contains('Close')
      .should('be.visible')
      .click();
  });

  it('Check CR groups list', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.contains('ui5-title', 'Custom Resources').should('be.visible');

    cy.get('ui5-button[aria-label="open-search"]')
      .click()
      .get('input[aria-label="search-input"]')
      .type('cypress');

    cy.get('table').should('have.length', 1);

    cy.get('[role=row]')
      .contains('Tnamespaces')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('Tnamespaces')
      .click();

    cy.get('[aria-label="title"]')
      .contains('Tnamespaces')
      .should('be.visible');

    cy.contains(/Create Tnamespace/i).should('be.visible');

    cy.url().should('match', /customresources/);
    cy.contains('tnamespace.cypress.example.com').click();
    cy.url().should('match', /customresourcedefinitions/);
    cy.deleteInDetails('tnamespace.cypress.example.com');
  });
});
