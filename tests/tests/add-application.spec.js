/// <reference types="cypress" />

context('Test Adding Apliacton', () => {
  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
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
      .contains('Create Appliction')
      .click();

    cy.getIframeBody()
      .find('[placeholder="Specify a name for your Application.')
      .type('mock-app');

    cy.getIframeBody()
      .find('[role="dialog"]')
      .contains('button', 'Create')
      .click();
  });

  it('Check added application', () => {
    cy.getIframeBody()
      .contains('mock-app')
      .should('be.visible');
  });
});
