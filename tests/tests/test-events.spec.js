/// <reference types="cypress" />

context('Test Events', () => {
  before(() => {
    cy.loginAndSelectCluster();
  });

  it('Checking list', () => {
    cy.getLeftNav()
      .contains('Events')
      .click();

    cy.getIframeBody()
      .find('tbody tr')
      .its('length')
      .should('be.gte', 1);

    cy.getIframeBody()
      .contains('.fd-table__cell', Cypress.env('NAMESPACE_NAME'))
      .its('length')
      .should('be.gte', 1);

    cy.getIframeBody()
      .find('[role="search"] [aria-label="open-search"]')
      .type(`Pod`);

    cy.getIframeBody()
      .find('a[data-testid="details-link"]')
      .filter(':visible', { log: false })
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
