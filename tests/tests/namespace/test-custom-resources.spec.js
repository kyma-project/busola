/// <reference types="cypress" />

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Check CR groups list', () => {
    cy.wait(500); // TODO
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.contains('h3', 'Custom Resources').should('be.visible');

    cy.get('[role="search"] [aria-label="open-search"]').type('serverless');

    cy.get('table').should('have.length', 1);

    cy.get('[role=row]')
      .contains('Functions')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('Functions')
      .click();

    cy.get('[aria-label="title"]')
      .contains('Functions')
      .should('be.visible');

    cy.contains('in-cluster-eventing-receiver').should('be.visible');

    cy.contains('in-cluster-eventing-publisher').should('be.visible');

    cy.contains('functions.serverless.kyma-project.io').click();

    cy.url().should('match', /customresources/);
  });
});
