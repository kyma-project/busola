/// <reference types="cypress" />
const DESC = 'beautiful, pretty cluster for all our test needs';
const TEMP_NAME = 'clustered';

let originalName;

context('Test edit cluster', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Changes cluster name and adds description', () => {
    cy.get('.ui5-shellbar-menu-button').click();
    cy.contains('Clusters Overview').click();

    cy.get('ui5-table-cell')
      .eq(0)
      .then(el => (originalName = el.text()));

    cy.get('button[data-testid="edit"]').click();

    cy.get('input[data-testid="cluster-description"]')
      .click()
      .type(DESC);

    cy.get('input[date-testid="cluster-name"]')
      .first()
      .type(`{selectall}{backspace}`)
      .type(TEMP_NAME);

    cy.contains('button', 'Update').click();

    cy.contains(TEMP_NAME)
      .should('be.visible')
      .click();

    cy.contains('Clusters Overview').click();

    cy.contains(DESC).should('be.visible');
  });

  it('Restores previous settings', () => {
    cy.get('button[data-testid="edit"]').click();

    cy.get('input[date-testid="cluster-name"]')
      .first()
      .type(`{selectall}{backspace}`)
      .type(originalName);

    cy.contains('button', 'Update').click();

    cy.contains(originalName)
      .should('be.visible')
      .click();
  });
});
