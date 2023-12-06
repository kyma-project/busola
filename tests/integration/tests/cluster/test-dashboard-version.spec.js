/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.get('.ui5-sn-spacer')
      .next()
      .find('[role="treeitem"]')
      .last()
      .should('have.attr', 'title')
      .and('include', 'Kyma Dashboard version:');
  });
});
