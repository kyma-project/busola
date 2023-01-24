/// <reference types="cypress" />

const PIZZA_NAME = 'diavola';

context('Test Custom Resources', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
    cy.goToNamespaceDetails();
  });

  it('Check CR groups list', () => {
    cy.navigateTo('Configuration', 'Custom Resources');

    cy.contains('h3', 'Custom Resources').should('be.visible');

    cy.get('[role="search"] [aria-label="open-search"]').type('busola.example');

    cy.get('table').should('have.length', 1);

    cy.get('[role=row]')
      .contains('Pizzas')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('Pizzas')
      .click();

    cy.get('[aria-label="title"]')
      .contains('Pizzas')
      .should('be.visible');

    cy.contains(PIZZA_NAME).should('be.visible');

    cy.contains('pizzas.busola.example.com').click();

    cy.url().should('match', /customresourcedefinitions/);
  });
});
