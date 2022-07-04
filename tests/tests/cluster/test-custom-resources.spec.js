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

    cy.getIframeBody()
      .contains('h3', 'Custom Resources')
      .should('be.visible');

    openSearchWithSlashShortcut();

    cy.getIframeBody()
      .find('[type="search"]')
      .type('app');

    cy.getIframeBody()
      .find('table')
      .should('have.length', 1);

    cy.getIframeBody()
      .contains('Applications')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.getIframeBody()
      .contains('Applications')
      .click();

    cy.getIframeBody()
      .contains('Applications')
      .should('be.visible');

    cy.getIframeBody()
      .contains(/Create Application/i)
      .should('be.visible');

    cy.getIframeBody()
      .contains('applicationconnector.kyma-project.io')
      .click();

    cy.url().should('match', /customresourcedefinitions/);
  });
});
