/// <reference types="cypress" />

context('Test Events', () => {
  Cypress.skipAfterFail();

  before(() => {
    cy.setBusolaFeature('HIDDEN_NAMESPACES', false);

    cy.loginAndSelectCluster();
  });

  it('Checking list', () => {
    cy.getLeftNav()
      .contains('Events')
      .click();

    cy.get('ui5-table-cell ui5-link')
      .first()
      .click({ force: true });
  });

  it('Check details', () => {
    cy.getMidColumn()
      .contains('Involved Object')
      .next('.content')
      .should('not.be.empty');

    cy.getMidColumn()
      .contains('Source')
      .next('.content')
      .should('not.be.empty');

    cy.getMidColumn()
      .contains('Type')
      .next('.content')
      .should('not.be.empty');

    cy.getMidColumn()
      .contains('Count')
      .next('.content')
      .should('not.be.empty');

    cy.getMidColumn()
      .contains('Message')
      .should('be.visible');

    cy.getMidColumn()
      .contains('Reason')
      .should('be.visible');
  });
});
