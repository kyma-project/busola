/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.get('[title="Profile"]').click();

    cy.get('.ui5-menu-rp')
      .find('ui5-menu-li:visible')
      .contains('Legal Information')
      .click({ force: true });

    cy.get('ui5-responsive-popover[placement-type="Right"]')
      .find('ui5-menu-li:visible')
      .contains('Kyma Dashboard version:')
      .should('be.visible');
  });
});
