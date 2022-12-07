/// <reference types="cypress" />
function openSearchWithSlashShortcut() {
  cy.get('body').type('/');
}

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check CR groups list with slash shortcut', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.contains('h3', 'Custom Resources').should('be.visible');

    openSearchWithSlashShortcut();

    cy.get('[type="search"]').type('app');

    cy.get('table').should('have.length', 1);

    cy.get('[role=row]')
      .contains('Applications')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('Applications')
      .click();

    cy.get('[aria-label="title"]')
      .contains('Applications')
      .should('be.visible');

    cy.contains(/Create Application/i).should('be.visible');

    cy.contains('applicationconnector.kyma-project.io').click();

    cy.url().should('match', /customresources/);
  });
});
