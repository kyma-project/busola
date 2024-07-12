/// <reference types="cypress" />
import config from '../../config';

const DESC = 'beautiful, pretty cluster for all our test needs';
const TEMP_NAME = 'clustered';

let originalName;

context('Test edit cluster', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Changes cluster name and adds description', () => {
    cy.visit(`${config.clusterAddress}/clusters`);

    cy.get('ui5-table-cell')
      .eq(0)
      .then(el => (originalName = el.text()));

    cy.get('ui5-button[data-testid="edit"]').click();

    cy.get('ui5-input[data-testid="cluster-description"]')
      .find('input')
      .click()
      .type(DESC);

    cy.get('ui5-input[date-testid="cluster-name"]')
      .first()
      .find('input')
      .type(`{selectall}{backspace}`)
      .type(TEMP_NAME);

    cy.contains('ui5-button', 'Update').click();

    cy.get('.header')
      .find('button')
      .contains(TEMP_NAME)
      .should('be.visible')
      .click();

    cy.get('ui5-li:visible')
      .contains('Clusters Overview')
      .click({ force: true });
    cy.visit(`${config.clusterAddress}/clusters`); ///////////////////////////////////FIX

    cy.contains(DESC).should('be.visible');
  });

  it('Restores previous settings', () => {
    cy.get('ui5-button[data-testid="edit"]').click();

    cy.get('ui5-input[date-testid="cluster-name"]')
      .first()
      .find('input')
      .type(`{selectall}{backspace}`)
      .type(originalName);

    cy.contains('ui5-button', 'Update').click();

    cy.contains(originalName)
      .should('be.visible')
      .click();
  });
});
