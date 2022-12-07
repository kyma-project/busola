/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.get('[data-test-id="version-link"]')
      .should('have.attr', 'href')
      .and('include', 'github.com/kyma-project/busola');
  });
});
