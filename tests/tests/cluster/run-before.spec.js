/// <reference types="cypress" />

context('Create Application', () => {
  Cypress.skipAfterFail({ skipAllSuits: true });

  before(cy.loginAndSelectCluster);

  it('Create Application', () => {
    cy.navigateTo('Integration', 'Applications');

    cy.getIframeBody()
      .contains('Create Application')
      .click();

    cy.getIframeBody()
      .find('[role=dialog]')
      .find("input[ariaLabel='Application name']:visible")
      .type(Cypress.env('APP_NAME'));

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();

    cy.getIframeBody()
      .contains(Cypress.env('APP_NAME'))
      .should('be.visible');
  });
});
