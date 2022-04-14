/// <reference types="cypress" />

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Check CR groups list', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    const iframeBody = cy.getIframeBody();

    cy.getIframeBody()
      .contains('h3', 'Custom Resources')
      .should('be.visible');

    cy.getIframeBody()
      .find('[type=search]')
      .type('serverless');

    cy.getIframeBody()
      .find('table')
      .should('have.length', 1);

    cy.getIframeBody()
      .contains('Functions')
      .should('be.visible');

    cy.getIframeBody()
      .contains('GitRepositories')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.getIframeBody()
      .contains('Functions')
      .click();

    cy.getIframeBody()
      .contains('Functions')
      .should('be.visible');

    cy.getIframeBody()
      .contains('in-cluster-eventing-receiver')
      .should('be.visible');

    cy.getIframeBody()
      .contains('in-cluster-eventing-publisher')
      .should('be.visible');

    cy.getIframeBody()
      .contains('functions.serverless.kyma-project.io')
      .click();

    cy.url().should('match', /customresourcedefinitions/);
  });
});
