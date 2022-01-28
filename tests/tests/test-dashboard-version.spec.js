/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.getLeftNav()
      .find('[data-test-id="version-link"]', { timeout: 7000 })
      .should('have.attr', 'href')
      .and('include', 'github.com/kyma-project/busola');
  });
});
