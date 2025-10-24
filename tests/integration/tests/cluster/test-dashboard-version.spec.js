/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.get('[tooltip="Profile"]').click({ force: true });

    cy.get('ui5-menu')
      .find('ui5-menu-item:visible')
      .contains('Legal Information')
      .click({ force: true });

    cy.get('li:visible')
      .contains('Kyma Dashboard version:')
      .should('be.visible');
  });
});
