/// <reference types="cypress" />

import { loadFile } from '../../support/loadFile';

const FILE_NAME = 'test-customresourcedefinisions-namespaced.yaml';

function getQueryInput() {
  return cy.get('[aria-label=command-palette-search]').find('input');
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();

    cy.get('body').type(
      `${Cypress.platform === 'darwin' ? '{cmd}k' : '{ctrl}k'}`,
    );

    getQueryInput().type('up{enter}');

    cy.wrap(loadFile(FILE_NAME)).then(CRD_CONFIG => {
      const CRD = JSON.stringify(CRD_CONFIG);
      cy.pasteToMonaco(CRD);
    });

    cy.get('ui5-dialog')
      .contains('ui5-button', 'Upload')
      .should('be.visible')
      .click();

    cy.get('ui5-dialog')
      .find('.status-message-success')
      .should('have.length', 1);

    cy.get('ui5-dialog')
      .find('[aria-label="yaml-upload-close"]')
      .should('be.visible')
      .click();
  });

  it('Check CR groups list', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.contains('ui5-title', 'Custom Resources').should('be.visible');

    cy.get('ui5-input[placeholder="Search"]:visible')
      .find('input')
      .wait(1000)
      .type('cypress', {
        force: true,
      });

    cy.get('table').should('have.length', 1);

    cy.get('ui5-table-row')
      .contains('Tnamespaces')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.clickGenericListLink('Tnamespaces');

    cy.getMidColumn()
      .contains('ui5-title', 'Tnamespaces')
      .should('be.visible');

    cy.getMidColumn()
      .contains('ui5-button', /Create/i)
      .should('be.visible');

    cy.url().should('match', /customresources/);
    cy.getMidColumn()
      .contains('tnamespace.cypress.example.com')
      .click();

    cy.url().should('match', /customresourcedefinitions/);

    cy.wait(500);

    cy.deleteInDetails(
      'Custom Resource Definition',
      'tnamespace.cypress.example.com',
    );
  });
});
