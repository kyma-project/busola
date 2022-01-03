/// <reference types="cypress" />

context('Test Kyma Dashboard Version link', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Check Kyma Dashboard Version link', () => {
    cy.window().then(win => {
      expect(win.console.error).to.have.callCount(0);
    });
    cy.getLeftNav()
      .find('[data-test-id="version-link"]', { timeout: 7000 })
      .should('have.attr', 'href')
      .and('include', 'github.com/kyma-project/busola');
  });
});
