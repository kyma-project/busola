/// <reference types="cypress" />

context('Test Adding Application', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Nawigate to Application', () => {
    cy.getLeftNav()
      .contains('Integration')
      .click();

    cy.getLeftNav()
      .contains('Applications')
      .click();
  });

  it('Create Appliction', () => {
    cy.getIframeBody()
      .contains('Create Application')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Specify a name for your Application."]')
      .clear()
      .type('test-mock-app');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check added application', () => {
    cy.getIframeBody()
      .contains('test-mock-app')
      .should('be.visible');
  });
});
