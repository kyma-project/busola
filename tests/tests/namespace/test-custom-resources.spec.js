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

    cy.get('[role="search"] [aria-label="open-search"]').type(
      'cert.gardener.cloud',
    );

    cy.get('table').should('have.length', 3);

    cy.get('[role=row]')
      .contains('Certificates')
      .should('be.visible');
  });

  it('Check single CR list', () => {
    cy.get('[role=row]')
      .contains('Certificates')
      .click();

    cy.get('[aria-label="title"]')
      .contains('Certificates')
      .should('be.visible');

    cy.contains('cypress-test-name').should('be.visible');

    cy.contains('certificates.cert.gardener.cloud').click();

    cy.url().should('match', /customresourcedefinitions/);
  });
});
