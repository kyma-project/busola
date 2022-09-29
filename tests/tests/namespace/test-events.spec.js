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

    cy.getIframeBody()
      .find('td a')
      .first()
      .click({ force: true });
  });

  it('Check details', () => {
    cy.getIframeBody()
      .contains('Involved Object')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Source')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Type')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Count')
      .next('.content')
      .should('not.be.empty');

    cy.getIframeBody()
      .contains('Message')
      .should('be.visible');

    cy.getIframeBody()
      .contains('Reason')
      .should('be.visible');
  });
});
