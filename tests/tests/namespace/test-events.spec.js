/// <reference types="cypress" />

context('Test Events', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Checking list', () => {
    cy.getLeftNav()
      .contains('Events')
      .click();

    cy.get('td a')
      .first()
      .click({ force: true });
  });

  it('Check details', () => {
    cy.contains('Involved Object')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Source')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Type')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Count')
      .next('.content')
      .should('not.be.empty');

    cy.contains('Message').should('be.visible');

    cy.contains('Reason').should('be.visible');
  });
});
