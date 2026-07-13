/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.get('[tooltip="User Menu"]').click({ force: true });

    cy.get('ui5-menu[opener="openShellbarMenu"]')
      .find('ui5-menu-item:visible')
      .contains('About')
      .click({ force: true });

    cy.get('li:visible')
      .contains('Kyma Dashboard version:')
      .should('be.visible');
  });
});
